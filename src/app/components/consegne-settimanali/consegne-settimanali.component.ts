import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from "../baseComponent";
import { ActivatedRoute, Router } from "@angular/router";
import { ViewportScroller } from "@angular/common";
import { ScrollPositionService } from "../../services/scroll-position.service";
import { AuthService } from "../../services/auth/auth.service";
import { EmailService } from "../../services/email/email.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { takeUntil } from "rxjs";

import { FiltroOrdini } from "../../models/FiltroOrdini";
import { ListaService } from "../../services/ordine-cliente/logistica/lista.service";
import { ArticoloService } from "../../services/ordine-cliente/articolo/articolo.service";

import {
  ConsegneSettimanaliDettaglioDialogComponent
} from "../consegne-settimanali-dettaglio-dialog/consegne-settimanali-dettaglio-dialog.component";

import { NotaConsegna } from "../../models/NotaConsegna";
import { NotaConsegnaService } from "../../services/nota-consegna/nota-consegna.service";
import { OrdineMappaDto } from "../../models/ordineMappaDto";
import {GiornoConsegne} from "../../models/GiornoConsegne";
import {ConsegneSettimanali} from "../../models/ConsegneSettimanali";


const moment = require('moment');

@Component({
  selector: 'app-consegne-settimanali',
  templateUrl: './consegne-settimanali.component.html',
  styleUrls: ['./consegne-settimanali.component.css']
})
export class ConsegneSettimanaliComponent extends BaseComponent implements OnInit {

  loader = false;

  filtro: FiltroOrdini = new FiltroOrdini();

  user: any;

  giorni: GiornoConsegne[] = [];

  noteConsegna: { [key: string]: NotaConsegna } = {};

  showMappa: boolean = false;

  ordiniMappa: OrdineMappaDto[] = [];

  @Input() compactMode: boolean = false;

  @Input() selectable: boolean = false;

  @Input() veicolo: number | null = null;

  @Input() fascia: string | null = null;

  @Output() giornoSelezionato = new EventEmitter<any>();

  giornoSelezionatoCorrente: any;

  constructor(
    private notaConsegnaService: NotaConsegnaService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private scrollPositionService: ScrollPositionService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private emailService: EmailService,
    private service: ListaService,
    private articoloService: ArticoloService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private route: Router
  ) {
    super();
  }

  ngOnInit(): void {

    this.retrieveList(0);

    this.user = this.authService.getCurrentUser()?.username;

  }

  mostraMappa(): void {

    this.showMappa = !this.showMappa;

    if (this.showMappa) {
      this.loadOrdiniMappa();
    }

  }

  loadOrdiniMappa(): void {

    this.service.getAllForMap(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.ordiniMappa = data;
        }
      });

  }

  retrieveList(delta: number): void {

    this.loader = true;

    this.filtro.deltaSettimana = delta;

    this.service.getConsegneSettimanali(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({

        next: (data: ConsegneSettimanali) => {

          this.giorni = data?.giorni || [];

          this.giorni.forEach(g => {

            if (g.data) {
              this.getNotaConsegna(g.data);
            }

          });

          this.loader = false;

        },

        error: () => {
          this.loader = false;
        }

      });

  }

  getNotaConsegna(dataConsegna: any): void {

    const date = moment(dataConsegna);

    const data = date.format('DDMMyyyy');

    this.notaConsegnaService.getNota(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({

        next: (nota: NotaConsegna) => {

          this.noteConsegna[data] = nota ? nota : new NotaConsegna();

        }

      });

  }

  getNota(giorno: GiornoConsegne): NotaConsegna {

    const key = moment(giorno.data).format('DDMMyyyy');

    return this.noteConsegna[key];

  }

  onClickConsegna(consegna: any, giorno: GiornoConsegne): void {

    if (this.selectable) {

      this.giornoSelezionatoCorrente = giorno;

      this.giornoSelezionato.emit(giorno);

      return;

    }

    this.dettaglio(consegna);

  }

  dettaglio(consegna: any) {

    this.dialog.open(ConsegneSettimanaliDettaglioDialogComponent, {
      width: '90%',
      data: consegna,
      autoFocus: false,
      maxHeight: '90vh'
    });

  }

  selezionaGiorno(giorno: any): void {

    if (!this.selectable) {
      return;
    }

    this.giornoSelezionatoCorrente = giorno;

    this.giornoSelezionato.emit(giorno);

  }

  getLabelGiorno(giorno: string): string {

    switch (giorno) {
      case 'MONDAY':
        return 'LUN';
      case 'TUESDAY':
        return 'MAR';
      case 'WEDNESDAY':
        return 'MER';
      case 'THURSDAY':
        return 'GIO';
      case 'FRIDAY':
        return 'VEN';
      case 'SATURDAY':
        return 'SAB';
      default:
        return giorno;
    }

  }

}
