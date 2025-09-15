import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from '@angular/material/snack-bar';
import {FatturaAccontoCartDialogComponent} from "../fattura-acconto-cart-dialog/fattura-acconto-cart-dialog.component";
import {forkJoin, Observable, takeUntil} from 'rxjs';
import {OrdineClienteService} from "../../services/ordine-cliente/list/ordine-cliente.service";
import {AccontiNonValidatiDialogComponent} from "../acconti-non-validati-dialog/acconti-non-validati-dialog.component";
import {BaseComponent} from "../baseComponent";

export interface DialogData {
  ordini: any;
  intestazione: any;
  sottoConto: any;
}

@Component({
  selector: 'app-fattura-acconto-dialog',
  templateUrl: './fattura-acconto-dialog.component.html',
  styleUrls: ['./fattura-acconto-dialog.component.css']
})
export class FatturaAccontoDialogComponent extends BaseComponent implements OnInit {
  ordini: any = [];
  acconti: AccontoIva[] = [];
  intestazione: any;
  sottoConto: any;
  tabSelezionato = 0; // primo tab aperto di default
  nonValidatiCountByKey: Record<string, number> = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
              private ordineService: OrdineClienteService,
              private dialogRef: MatDialogRef<FatturaAccontoDialogComponent>,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
    super();
    this.ordini = data.ordini;
    this.intestazione = data.intestazione;
    this.sottoConto = data.sottoConto;
  }

  ngOnInit(): void {
    const calls: Observable<number>[] = (this.ordini || []).map((o: any) =>
      this.ordineService.getAccontiNonValidatiCount(o.anno, o.serie, o.progressivo)
    );

    if (calls.length) {
      forkJoin(calls).subscribe({
        next: (counts: number[]) => {
          this.ordini.forEach((o: any, i: number) => {
            this.nonValidatiCountByKey[this.keyOrdine(o)] = counts[i] || 0;
          });
          // inizializza le stringhe UI dai valori numerici presenti
          this.ordini.forEach((o: any) => {
            (o.fatturaAccontoIvaViewList || []).forEach((iva: any) => this.syncStringsFromModel(iva));
          });
        },
        error: () => {
          this.snackBar.open('Errore nel controllo acconti non validati', 'Chiudi', {
            duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });
    } else {
      // nessuna chiamata: inizializza comunque le stringhe
      this.ordini.forEach((o: any) => {
        (o.fatturaAccontoIvaViewList || []).forEach((iva: any) => this.syncStringsFromModel(iva));
      });
    }
  }

  // ---------- Helpers numerici / formattazione ----------
  private round2(value: any): number {
    return value == null || isNaN(value) ? 0 : Math.round((+value + Number.EPSILON) * 100) / 100;
  }

  private parseNumber(value: any): number {
    if (value == null || value === '') return NaN;
    const normalized = ('' + value).replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? NaN : num;
  }

  private parseAndRound(value: any): number {
    const n = this.parseNumber(value);
    return isNaN(n) ? 0 : this.round2(n);
  }

  /** Per la UI: sempre due decimali e virgola */
  format2(value: any): string {
    const n = this.parseNumber(value);
    if (isNaN(n)) return '';
    return n.toFixed(2).replace('.', ',');
  }

  /** Allinea le stringhe UI dai valori numerici */
  syncStringsFromModel(iva: any) {
    iva.nuovoAccontoIvatoStr = this.format2(iva.nuovoAccontoIvato);
    iva.percentualeStr = this.format2(iva.percentuale);
  }

  // ---------- Calcoli business (non toccano le stringhe UI) ----------
  calcolaIva(row: any) {
    row.nuovoAccontoIvato = this.round2(row.residuoFatturabileIvato * row.percentuale / 100);
    row.nuovoAcconto     = this.round2(row.residuoFatturabile * row.percentuale / 100);
    row.percentuale      = this.round2(row.percentuale);
    row.aSaldo           = row.percentuale === 100;
  }

  calcolaPercentuale(iva: any, saldo: boolean) {
    if (saldo) {
      iva.nuovoAccontoIvato = this.round2(iva.residuoFatturabileIvato);
      iva.nuovoAcconto      = this.round2(iva.residuoFatturabile);
      iva.percentuale       = 100;
    } else {
      const denom = iva.residuoFatturabileIvato || 0;
      iva.percentuale = denom === 0 ? 0 : this.round2(iva.nuovoAccontoIvato / denom * 100);
      iva.nuovoAcconto = this.round2(iva.residuoFatturabile * iva.percentuale / 100);
    }
    iva.aSaldo = iva.percentuale === 100;
  }

  // ---------- Slider ----------
  onSliderChange(iva: any) {
    iva.nuovoAccontoIvato = this.round2(iva.nuovoAccontoIvato);
    this.calcolaPercentuale(iva, false);
    this.syncStringsFromModel(iva); // aggiorna UI a due decimali
  }

  // ---------- Input manuale: IMPORTO IVATO ----------
  onAccontoIvatoChange(iva: any, value: string) {
    // manteniamo la stringa così com'è mentre si digita
    iva.nuovoAccontoIvatoStr = value;

    const n = this.parseNumber(value);
    if (!isNaN(n)) {
      iva.nuovoAccontoIvato = n;            // aggiorna il modello numerico → muove lo slider
      this.calcolaPercentuale(iva, false);  // ricalcola la percentuale
      // Aggiorna SOLO la percentuale a video (non l'importo che stai digitando)
      iva.percentualeStr = this.format2(iva.percentuale);
    }
  }

  onAccontoIvatoBlur(iva: any, value: string) {
    const n = this.parseAndRound(value);
    iva.nuovoAccontoIvato = n;
    this.calcolaPercentuale(iva, false);
    this.syncStringsFromModel(iva); // ora entrambe le stringhe sono formattate xx,yy
  }

  // ---------- Input manuale: PERCENTUALE ----------
  onPercentualeChange(iva: any, value: string) {
    iva.percentualeStr = value;

    const n = this.parseNumber(value);
    if (!isNaN(n)) {
      iva.percentuale = n;
      this.calcolaIva(iva); // ricalcola importi
      // Aggiorna SOLO l'altro campo (importo) a video
      iva.nuovoAccontoIvatoStr = this.format2(iva.nuovoAccontoIvato);
    }
  }

  onPercentualeBlur(iva: any, value: string) {
    const n = this.parseAndRound(value);
    iva.percentuale = n;
    this.calcolaIva(iva);
    this.syncStringsFromModel(iva);
  }

  // ---------- Aggiunta al carrello / dialog ----------
  aggiungi(iva: any, ordine: any) {
    const element = {
      aSaldo: iva.aSaldo,
      iva: iva.fcodiceIva,
      nuovoAccontoIvato: this.round2(iva.nuovoAccontoIvato),
      nuovoAcconto: this.round2(iva.nuovoAcconto),
      anno: ordine.anno,
      serie: ordine.serie,
      progressivo: ordine.progressivo,
      contoCliente: this.sottoConto
    };
    if (this.acconti.length > 0) {
      let errore = false;
      this.acconti.forEach((a: AccontoIva) => {
        if (a.iva === element.iva && a.anno === element.anno && a.serie === element.serie && a.progressivo === element.progressivo) {
          this.snackBar.open('ATTENZIONE! Acconto già inserito', 'Chiudi', {
            duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          errore = true;
          return;
        }
      });
      if (!errore) {
        this.acconti.push(element);
        this.snackBar.open('Acconto inserito', 'Chiudi', {
          duration: 1000, horizontalPosition: 'right', verticalPosition: 'bottom'
        });
      }
    } else {
      this.acconti.push(element);
      this.snackBar.open('Acconto inserito', 'Chiudi', {
        duration: 1000, horizontalPosition: 'right', verticalPosition: 'bottom'
      });
    }
  }

  apriCarrello() {
    const dialogRef = this.dialog.open(FatturaAccontoCartDialogComponent, {
      width: '90%',
      data: {
        acconti: this.acconti,
        intestazione: this.intestazione,
        sottoConto: this.sottoConto
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close(this.acconti);
      }
    });
  }

  // ---------- Util ----------
  chiudi() {
    this.dialogRef.close();
  }

  keyOrdine(o: any): string {
    return `${o.anno}/${o.serie}/${o.progressivo}`;
  }

  hasNonValidati(o: any): boolean {
    const k = this.keyOrdine(o);
    return (this.nonValidatiCountByKey[k] || 0) > 0;
  }

  apriNonValidatiPerOrdine(ordine: any) {
    this.ordineService.getAccontiNonValidatiByOrdine(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (list) => {
          if (!list?.length) {
            this.snackBar.open('Nessun acconto non validato per questo ordine', 'Chiudi', { duration: 3000 });
            return;
          }
          this.dialog.open(AccontiNonValidatiDialogComponent, { width: '600px', data: list });
        },
        error: () => {
          this.snackBar.open('Errore nel recupero acconti non validati', 'Chiudi', { duration: 3000 });
        }
      });
  }
}

export interface AccontoIva {
  iva: any
  nuovoAccontoIvato: any
  nuovoAcconto: any
  anno: any
  serie: any
  progressivo: any
  contoCliente: any
  aSaldo: boolean

  // campi UI (stringhe) per evitare riformattazioni mentre si digita
  nuovoAccontoIvatoStr?: string
  percentualeStr?: string
}
