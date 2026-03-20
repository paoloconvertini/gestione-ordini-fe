import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {ViewportScroller} from "@angular/common";
import {ScrollPositionService} from "../../services/scroll-position.service";
import {AuthService} from "../../services/auth/auth.service";
import {EmailService} from "../../services/email/email.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";

import {FiltroOrdini} from "../../models/FiltroOrdini";
import {ListaService} from "../../services/ordine-cliente/logistica/lista.service";
import {ArticoloService} from "../../services/ordine-cliente/articolo/articolo.service";

import {
  ConsegneSettimanaliDettaglioDialogComponent
} from "../consegne-settimanali-dettaglio-dialog/consegne-settimanali-dettaglio-dialog.component";

import {NotaConsegna} from "../../models/NotaConsegna";
import {NotaConsegnaService} from "../../services/nota-consegna/nota-consegna.service";
import {OrdineMappaDto} from "../../models/ordineMappaDto";
import {GiornoConsegne} from "../../models/GiornoConsegne";
import {ConsegneSettimanali} from "../../models/ConsegneSettimanali";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {ConsegnaEditDialogComponent} from "../consegna-edit-dialog/consegna-edit-dialog.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {NotaConsegnaDialogComponent} from "../nota-consegna-dialog/nota-consegna-dialog.component";
import {PianocontiService} from "../../services/pianoconti/pianoconti.service";
import {CoordinateDialogComponent} from "../coordinate-dialog/coordinate-dialog.component";
import {OrdineClienteNoteDialogComponent} from "../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {OrdineClienteNotaDto} from "../../models/OrdineClienteNotaDto";
import {OrdineClienteService} from "../../services/ordine-cliente/list/ordine-cliente.service";


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
    private authService: AuthService,
    private service: ListaService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private pianoContiService: PianocontiService,
    private ordineClienteService: OrdineClienteService,
  ) {
    super();
  }

  ngOnInit(): void {

    this.retrieveList(0);

    this.user = this.authService.getCurrentUser()?.username;

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
          if (this.showMappa) {
            this.buildOrdiniMappa();
          }
          this.loader = false;

        },

        error: () => {
          this.loader = false;
        }

      });

  }

  private buildOrdiniMappa(): void {

    const result: OrdineMappaDto[] = [];

    for (const giorno of this.giorni) {

      if (!giorno.fasce) continue;

      for (const fascia of giorno.fasce) {

        if (!fascia.veicoli) continue;

        for (const veicolo of fascia.veicoli) {

          if (!veicolo.consegne) continue;

          for (const c of veicolo.consegne) {

            if (!c.latitudine || !c.longitudine) continue;

            result.push({
              anno: c.anno,
              serie: c.serie,
              progressivo: c.progressivo,
              latitudine: c.latitudine,
              longitudine: c.longitudine,
              intestazione: c.intestazione,
              indirizzo: c.indirizzo,
              telefono: c.telefono,
              cellulare: c.cellulare,
              sottoConto: c.sottoConto,
              ordine: c.ordine,
              oraConsegna: c.oraConsegna,
              idVeicolo: c.veicolo,
              localita: c.localita
            });

          }

        }

      }

    }

    this.ordiniMappa = result;
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

  apriNota(giorno: GiornoConsegne): void {

    const key = moment(giorno.data).format('DDMMyyyy');

    const notaEsistente = this.noteConsegna[key];

    const dialogRef = this.dialog.open(NotaConsegnaDialogComponent, {
      width: '500px',
      data: {
        nota: notaEsistente ? notaEsistente.nota : ''
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((testo: string | undefined) => {

          if (testo === undefined) {
            return;
          }

        const dto: any = {
          id: notaEsistente?.id || null,
          dataNota: giorno.data,
          nota: testo
        };

        this.notaConsegnaService.salvaNota(dto)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((res: any) => {

            if (res && !res.error) {

              this.snackbar.open(res.msg, 'Chiudi', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });

              this.getNotaConsegna(giorno.data);

            }

          });

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

  modificaConsegna(consegna: any): void {

    const dialogRef = this.dialog.open(ConsegnaEditDialogComponent, {
      width: '450px',
      data: { consegna }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.retrieveList(this.filtro.deltaSettimana);
      }

    });

  }

  eliminaConsegna(consegna: any): void {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        msg: 'Vuoi eliminare la programmazione della consegna?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }

      this.service.eliminaProgrammazione(
        consegna.anno,
        consegna.serie,
        consegna.progressivo
      ).subscribe(() => {

        this.snackbar.open('Consegna rimossa', 'OK', {
          duration: 2000
        });

        this.retrieveList(this.filtro.deltaSettimana);

      });

    });

  }

  drop(event: CdkDragDrop<any[]>, veicolo: any): void {

    if (event.previousIndex === event.currentIndex) {
      return;
    }

    moveItemInArray(
      veicolo.consegne,
      event.previousIndex,
      event.currentIndex
    );

    const lista = veicolo.consegne.map((c: any, index: number) => ({
      anno: c.anno,
      serie: c.serie,
      progressivo: c.progressivo,
      ordine: index + 1
    }));

    this.service.riordinaConsegne(lista)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.retrieveList(this.filtro.deltaSettimana);
      });

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

  apriMappaGiorno(giorno: GiornoConsegne): void {
    if (this.showMappa && this.giornoSelezionatoCorrente === giorno) {
      this.showMappa = false;
      this.ordiniMappa = [];
      return;
    }
    this.giornoSelezionatoCorrente = giorno;

    const result: OrdineMappaDto[] = [];

    if (giorno.fasce) {
      for (const fascia of giorno.fasce) {

        if (!fascia.veicoli) continue;

        for (const veicolo of fascia.veicoli) {

          if (!veicolo.consegne) continue;

          for (const c of veicolo.consegne) {
            console.log("CHECK CONSEGNA", c.intestazione, c.latitudine, c.longitudine);

            if (!c.latitudine || !c.longitudine) continue;

            result.push({
              anno: c.anno,
              serie: c.serie,
              progressivo: c.progressivo,
              latitudine: c.latitudine,
              longitudine: c.longitudine,
              intestazione: c.intestazione,
              indirizzo: c.indirizzo,
              telefono: c.telefono,
              cellulare: c.cellulare,
              sottoConto: c.sottoConto,
              ordine: c.ordine,
              oraConsegna: c.oraConsegna,
              idVeicolo: c.veicolo,
              localita: c.localita
            });

          }
        }
      }
    }

    this.ordiniMappa = result;
    this.showMappa = true;

  }

  hasMissingCoords(c: any): boolean {
    return !c.latitudine || !c.longitudine || (c.latitudine === 0 && c.longitudine === 0);
  }

  onOptimizationApplied(lista: any[]) {

    this.service.riordinaConsegne(lista)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.retrieveList(this.filtro.deltaSettimana);
      });

  }

  fixCoordinates(consegna: any, event: MouseEvent) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CoordinateDialogComponent, {
      width: '400px',
      data: {
        indirizzo: `${consegna.indirizzo} ${consegna.localita}`,
        sottoConto: consegna.sottoConto
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result) => {

        if (!result) return;

        this.pianoContiService.updateCoordinates({
          sottoConto: consegna.sottoConto,
          coords: result.coords
        }).subscribe(() => {

          this.snackbar.open('Coordinate aggiornate', 'OK', {
            duration: 2000
          });

          this.retrieveList(this.filtro.deltaSettimana);

        });

      });
  }

  aggiungiNote(ordine: any) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    data.note = ordine.note;
    data.userNote = ordine.userNote;
    data.dataNote = ordine.dataNote;

    {
      const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
        width: '50%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loader = true;
          this.ordineClienteService.addNotes(result, 0).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                  ordine.note = result.note;
                }
              },
              error: (e) => {
                console.error(e);
                this.snackbar.open('Errore! Nota non creata', 'Chiudi', {
                  duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
                })
                this.loader = false;
              }
            });
        }
      });
    }
  }



  copiaDati(consegna: any) {

    const testo = [
      consegna.intestazione,
      consegna.indirizzo,
      consegna.localita,
      consegna.cellulare
    ]
      .filter(x => x)
      .join('\n');

    navigator.clipboard.writeText(testo);

    this.snackbar.open('Dati copiati', 'OK', {
      duration: 2000
    });
  }
}
