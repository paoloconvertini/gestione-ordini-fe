import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { ShowroomService } from '../../services/showroom/showroom.service';
import { PermissionService } from '../../services/auth/permission.service';
import {FiltroShowroom} from "../../models/FiltroShowroom";
import {RegistroVisiteDialogComponent} from "../registro-visite-dialog/registro-visite-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AssociaClienteDialogComponent} from "../associa-cliente-dialog/associa-cliente-dialog.component";
import {AuthService} from "../../services/auth/auth.service";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import {EventActionsDialogComponent} from "../event-actions-dialog/event-actions-dialog.component";

@Component({
  selector: 'app-showroom',
  templateUrl: './showroom.component.html',
  styleUrls: ['./showroom.component.css']
})
export class ShowroomComponent extends BaseComponent implements OnInit {

  loader = false;
  dataSource: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'dataVisita',
    'nomeCliente',
    'comune',
    'motivo',
    'venditore',
    'azioni'
  ];

  filtro: FiltroShowroom = new FiltroShowroom();

  totalItems = 0;
  pageResult: any;
  province: string[] = [];
  listaComuni: any[] = [];
  sedi: any[] = [];
  comuneSearch: string | null = null;
  radioPerVenditoreOptions: any[] = [];
  calendarOptions: any = {};
  motiviRoot: any[] = [];

  constructor(
    private service: ShowroomService,
    public perm: PermissionService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadProvince();
    this.retrieveList();
    this.initCalendar();
    if (this.perm.canFilterSede) {
      this.loadSedi();
    }
    this.getVenditori();
    this.loadMotiviRoot();
    this.displayedColumns = [
      ...(this.perm.canFilterSede ? ['sede'] : []),
      'dataVisita',
      'nomeCliente',
      'comune',
      'motivo',
      'venditore',
      'azioni'
    ];
  }

  initCalendar() {
    this.calendarOptions = {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,       // 👈 settimana
        interactionPlugin
      ],

      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek' // 👈 switch
      },

      buttonText: {
        today: 'Oggi',
        month: 'Mese',
        week: 'Settimana'
      },

      locale: 'it',
      height: 'auto',
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',
      events: [],
      eventDisplay: 'auto',

      eventDidMount: (info: any) => {
        const tooltip = info.event.extendedProps.tooltip;

        if (tooltip) {
          info.el.setAttribute('title', tooltip);
        }
      },

      dateClick: (arg: any) => {
        this.openDialogWithDate(arg.date);
      },

      eventClick: (arg: any) => {

        const dialogRef = this.dialog.open(EventActionsDialogComponent, {
          width: '400px',
          data: arg.event.extendedProps
        });

        dialogRef.afterClosed().subscribe(result => {

          const evento = arg.event.extendedProps;

          if (result === 'modifica') {
            this.openDialog(evento);
          }

          if (result === 'nuovo') {
            this.openDialogWithDate(arg.event.start);
          }

          if (result === 'elimina') {
            this.delete(evento.id);
          }

          if (result === 'associa') {
            this.openAssociaCliente(evento.id);
          }

        });
      }
    };
  }

  cerca(): void {
    this.filtro.page = 0;
    this.retrieveList();
  }

  loadMotiviRoot() {
    this.service.getMotiviRoot()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.motiviRoot = res);
  }

  reset(): void {
    this.filtro = new FiltroShowroom();
    this.comuneSearch = null;
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;

    this.service.search(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.pageResult = data;
          this.dataSource = data.list;
          this.loadCalendarEvents();
          this.totalItems = data.count;
          this.loader = false;

        },
        error: () => {
          this.loader = false;
        }
      });
  }

  loadCalendarEvents() {
    const events = this.dataSource.map(e => ({
      id: e.id,
      title: `${e.nomeCliente}`,
      date: e.dataVisita,
      textColor: '#ffffff',
      extendedProps: {
        ...e,
        tooltip: this.buildTooltip(e)
      }
    }));
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  buildTooltip(e: any): string {

    let t = `Cliente: ${e.nomeCliente}\n`;
    t += `Venditore: ${e.venditoreNome}\n`;

    if (e.codiceCliente) {
      t += `Codice: ${e.codiceCliente}\n`;
    }

    if (e.sedeDescrizione) {
      t += `Sede: ${e.sedeDescrizione}\n`;
    }

    if (e.motivoDescrizione) {
      t += `Motivo: ${e.motivoDescrizione}`;
    }

    return t;
  }

  openDialogWithDate(date: Date) {
    const data = {
      dataVisita: date
    };
    const dialogRef = this.dialog.open(RegistroVisiteDialogComponent, {
      width: '700px',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.retrieveList();
      }
    });
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');

    this.authService.getVenditori(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.radioPerVenditoreOptions = data;
        },
        error: (e: any) => {
          console.error(e);
        }
      });
  }

  loadProvince() {
    this.service.getProvince()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.province = res);
  }

  onComuneSearch(value: string) {

    if (!value || value.length < 3) {
      this.listaComuni = [];
      return;
    }

    this.service.searchComuni(
      this.filtro.provincia || null,
      value
    ).subscribe(res => {
      this.listaComuni = res;
    });
  }

  selectComune(c: any) {

    this.filtro.comuneIstat = c.codiceIstat;
    this.comuneSearch = c.nomeComune;
    this.listaComuni = [];

    // opzionale ma elegante:
    this.filtro.provincia = c.siglaProvincia;
  }

  onProvinciaChange() {
    this.filtro.comuneIstat = null;
    this.comuneSearch = null;
    this.listaComuni = [];
  }

  delete(id: number) {

    if (!confirm('Confermi eliminazione?')) return;

    this.service.delete(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.retrieveList());
  }

  openDialog(element?: any) {

    const dialogRef = this.dialog.open(RegistroVisiteDialogComponent, {
      width: '700px',
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.retrieveList();
      }
    });
  }

  openAssociaCliente(id: number) {

    const dialogRef = this.dialog.open(
      AssociaClienteDialogComponent,
      { width: '500px', data: id }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cerca();
      }
    });
  }

  loadSedi() {
    this.service.getSedi().subscribe(res => {
      this.sedi = res;
    });
  }

  get currentSedeLabel(): string | null {
    return this.pageResult?.sedeCorrenteDescrizione ?? null;
  }

}
