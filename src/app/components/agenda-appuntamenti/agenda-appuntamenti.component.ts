import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../baseComponent';
import { AppuntamentoService } from '../../services/appuntamento/appuntamento.service';
import { AuthService } from '../../services/auth/auth.service';
import { ShowroomService } from '../../services/showroom/showroom.service';
import { AppuntamentoDialogComponent } from '../appuntamento-dialog/appuntamento-dialog.component';

@Component({
  selector: 'app-agenda-appuntamenti',
  templateUrl: './agenda-appuntamenti.component.html',
  styleUrls: ['./agenda-appuntamenti.component.css']
})
export class AgendaAppuntamentiComponent extends BaseComponent implements OnInit {

  loader = false;

  totalItems = 0;

  filtro: any = {};

  calendarOptions: any = {};

  sedi: any[] = [];

  venditori: any[] = [];

  motiviRoot: any[] = [];

  constructor(
    private service: AppuntamentoService,
    private authService: AuthService,
    private showroomService: ShowroomService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {

    this.initCalendar();

    this.loadSedi();

    this.loadVenditori();

    this.loadMotiviRoot();

    this.search();
  }

  initCalendar(): void {

    this.calendarOptions = {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin
      ],
      initialView: 'timeGridWeek',
      locale: 'it',
      height: 1200,
      expandRows: true,
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',
      allDaySlot: false,
      nowIndicator: true,
      slotEventOverlap: true,
      eventOverlap: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek,dayGridMonth'
      },
      buttonText: {
        today: 'Oggi',
        month: 'Mese',
        week: 'Settimana',
        day: 'Giorno'
      },
      events: [],
      eventContent: (arg: any) => {

        const e = arg.event.extendedProps;

        return {
          html: `
    <div class="appuntamento-event">
      <div class="appuntamento-event-venditore">
        ${e.venditoreLabel || ''} - ${e.sedeDescrizione || ''}
      </div>
      <div class="appuntamento-event-info">
        <strong>${e.dataOraLabel || ''}</strong>
      </div>
      <div class="appuntamento-event-cliente">
        ${e.clienteLabel || ''}
      </div>
      <div class="appuntamento-event-info">
          ${e.telefono || ''}
       </div>
      <div class="appuntamento-event-indirizzo">
        ${e.indirizzoLabel || ''}
      </div>
      <div class="appuntamento-event-info">
        ${e.motivoLabel || ''}
      </div>
    </div>
  `
        };      },
      eventDidMount: (info: any) => {

        const e = info.event.extendedProps;

        let tooltip = '';

        if (e.clienteLabel) {
          tooltip += e.clienteLabel;
        }

        if (e.venditoreLabel) {
          tooltip += '\nVenditore: ' + e.venditoreLabel;
        }

        if (e.motivoLabel) {
          tooltip += '\nMotivo: ' + e.motivoLabel;
        }

        if (e.sedeDescrizione) {
          tooltip += '\nSede: ' + e.sedeDescrizione;
        }

        info.el.setAttribute('title', tooltip);
      },
      eventClick: (info: any) => {
        this.openDialog(info.event.id);
      },
      dateClick: (info: any) => {
        this.openDialog(undefined, info.date);
      }
    };
  }

  loadSedi(): void {

    this.showroomService.getSedi()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.sedi = res;
      });
  }

  loadVenditori(): void {

    this.authService.getVenditori(['Venditore'])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.venditori = res;
      });
  }

  loadMotiviRoot(): void {

    this.showroomService.getMotiviRoot()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.motiviRoot = res;
      });
  }

  search(): void {

    this.loader = true;

    this.service.search(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {

          this.totalItems = res.count;

          const events: any[] = [];

          for (const e of res.list) {

            events.push({
              id: e.id,
              title: '',
              start: e.dataOraDa,
              end: e.dataOraA,
              backgroundColor: e.colore,
              borderColor: e.colore,
              textColor: '#ffffff',
              extendedProps: {
                ...e
              }
            });
          }

          this.calendarOptions = {
            ...this.calendarOptions,
            events: events
          };

          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  reset(): void {

    this.filtro = {};

    this.search();
  }

  openDialog(id?: number, data?: Date): void {

    const dialogRef = this.dialog.open(AppuntamentoDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: {
        id: id,
        dataAppuntamento: data
      }
    });

    dialogRef.afterClosed()
      .subscribe(result => {

        if (result) {
          this.search();
        }
      });
  }

  exportIcs(): void {

    this.service.exportIcs(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((blob: Blob) => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;

        a.download = 'agenda-appuntamenti.ics';

        a.click();

        window.URL.revokeObjectURL(url);
      });
  }
}
