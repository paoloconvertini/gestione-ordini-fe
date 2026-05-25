import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AttivitaMontaggioService } from '../../services/attivita-montaggio/attivita-montaggio.service';
import { OperaiService } from '../../services/operai/operai.service';
import {MatDialog} from "@angular/material/dialog";
import {AttivitaMontaggioDialogComponent} from "../attivita-montaggio-dialog/attivita-montaggio-dialog.component";

@Component({
  selector: 'app-attivita-montaggio',
  templateUrl: './attivita-montaggio.component.html',
  styleUrls: ['./attivita-montaggio.component.css']
})
export class AttivitaMontaggioComponent implements OnInit {

  loader = false;

  totalItems = 0;

  filtro: any = {};

  operai: any[] = [];

  calendarOptions: any = {};

  stati = [
    {
      value: 'PROGRAMMATO',
      label: 'Programmato'
    },
    {
      value: 'IN_CORSO',
      label: 'In corso'
    },
    {
      value: 'COMPLETATO',
      label: 'Completato'
    },
    {
      value: 'ANNULLATO',
      label: 'Annullato'
    }
  ];

  constructor(
    private service: AttivitaMontaggioService,
    private operaiService: OperaiService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.initCalendar();
    this.loadOperai();
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

      height: 'auto',

      slotMinTime: '07:00:00',

      slotMaxTime: '20:00:00',

      allDaySlot: false,

      nowIndicator: true,

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

      eventDidMount: (info: any) => {

        const e = info.event.extendedProps;

        let tooltip = '';

        tooltip += `Cliente: ${e.nomeCliente}`;

        if (e.numeroOrdine) {
          tooltip += `\nOrdine: ${e.numeroOrdine}`;
        }

        if (e.stato) {
          tooltip += `\nStato: ${this.getLabelStato(e.stato)}`;
        }

        if (e.scalaMobile) {
          tooltip += `\nScala mobile: SI`;
        }

        info.el.setAttribute('title', tooltip);
      },

      eventClick: (info: any) => {
        this.onEventClick(info.event);
      },

      dateClick: (info: any) => {
        this.onDateClick(info.date);
      }
    };
  }

  loadOperai(): void {

    this.operaiService.getAll()
      .subscribe({
        next: (res: any) => {
          this.operai = res;
        }
      });
  }

  search(): void {

    this.loader = true;

    this.service.search(this.filtro)
      .subscribe({
        next: (res: any) => {

          this.totalItems = res.count;

          const events = [];

          for (const e of res.list) {

            events.push({
              id: e.id,
              title: e.nomeCliente,
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

  onEventClick(event: any): void {

    const id = event.id;

    this.openDialog(id);
  }

  onDateClick(date: Date): void {

    this.openDialog(undefined, date);
  }

  getLabelStato(stato: string): string {

    const found = this.stati.find(
      s => s.value === stato
    );

    return found ? found.label : stato;
  }

  openDialog(id?: number, date?: Date): void {

    const dialogRef = this.dialog.open(
      AttivitaMontaggioDialogComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        data: {
          id: id,
          dataOraDa: date
        }
      }
    );

    dialogRef.afterClosed()
      .subscribe(result => {

        if (result) {
          this.search();
        }
      });
  }
}
