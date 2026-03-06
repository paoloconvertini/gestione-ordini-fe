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
  tabSelezionato = 0;
  nonValidatiCountByKey: Record<string, number> = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
              private ordineService: OrdineClienteService,
              private dialogRef: MatDialogRef<FatturaAccontoDialogComponent, AccontoIva[]>,
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

          this.ordini.forEach((o: any) => {
            (o.fatturaAccontoIvaViewList || []).forEach((iva: any) => {
              iva.nuovoAccontoIvato = 0;
              iva.nuovoAcconto = 0;
              iva.percentuale = 0;
              iva.aSaldo = false;

              iva.nuovoAccontoIvatoStr = '';
              iva.percentualeStr = '';
            });
          });

        },
        error: () => {
          this.snackBar.open('Errore nel controllo acconti non validati', 'Chiudi', {
            duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });

    }

  }

  private round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private parseNumber(value: any): number {
    if (value == null || value === '') return NaN;
    const normalized = ('' + value).replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? NaN : num;
  }

  format2(value: any): string {
    if (value == null || isNaN(value)) return '';
    return this.round2(value).toFixed(2).replace('.', ',');
  }

  private aggiornaDaIvato(iva: any) {
    const ivato = this.round2(iva.nuovoAccontoIvato || 0);
    const ivaPerc = Number(iva.fcodiceIva);
    iva.nuovoAcconto = this.round2(
      ivato / (1 + ivaPerc / 100)
    );
    const perc = iva.residuoFatturabileIvato === 0
      ? 0
      : this.round2(ivato / iva.residuoFatturabileIvato * 100);
    iva.percentuale = perc;
    iva.aSaldo = perc === 100;
    iva.nuovoAccontoIvatoStr = this.format2(ivato);
    iva.percentualeStr = this.format2(perc);
  }

  private aggiornaDaPercentuale(iva: any) {

    const perc = this.round2(iva.percentuale || 0);

    const ivato = this.round2(
      iva.residuoFatturabileIvato * perc / 100
    );

    iva.nuovoAccontoIvato = ivato;

    iva.nuovoAcconto = this.round2(
      iva.residuoFatturabile * perc / 100
    );

    iva.aSaldo = perc === 100;

    iva.nuovoAccontoIvatoStr = this.format2(ivato);
    iva.percentualeStr = this.format2(perc);

  }

  onSliderChange(iva: any) {

    const val = Number(iva.nuovoAccontoIvato);

    iva.nuovoAccontoIvato = this.round2(val);

    this.aggiornaDaIvato(iva);

  }

  onAccontoIvatoChange(iva: any, value: string) {

    iva.nuovoAccontoIvatoStr = value;

    const n = this.parseNumber(value);

    if (!isNaN(n)) {
      iva.nuovoAccontoIvato = n;
    }

  }

  onAccontoIvatoBlur(iva: any) {

    iva.nuovoAccontoIvato = this.round2(iva.nuovoAccontoIvato);

    this.aggiornaDaIvato(iva);

  }

  onPercentualeChange(iva: any, value: string) {

    iva.percentualeStr = value;

    const n = this.parseNumber(value);

    if (!isNaN(n)) {
      iva.percentuale = n;
    }

  }

  onPercentualeBlur(iva: any) {

    iva.percentuale = this.round2(iva.percentuale);

    this.aggiornaDaPercentuale(iva);

  }

  calcolaPercentuale(iva: any, saldo: boolean) {

    if (saldo) {

      iva.percentuale = 100;

      iva.nuovoAccontoIvato = this.round2(iva.residuoFatturabileIvato);
      iva.nuovoAcconto = this.round2(iva.residuoFatturabile);

      iva.nuovoAccontoIvatoStr = this.format2(iva.nuovoAccontoIvato);
      iva.percentualeStr = '100,00';

    } else {

      iva.percentuale = 0;
      iva.nuovoAccontoIvato = 0;
      iva.nuovoAcconto = 0;

      iva.nuovoAccontoIvatoStr = '';
      iva.percentualeStr = '';

    }

  }

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

    if (this.acconti.some((a: any) =>
      a.iva === element.iva &&
      a.anno === element.anno &&
      a.serie === element.serie &&
      a.progressivo === element.progressivo)) {

      this.snackBar.open('ATTENZIONE! Acconto già inserito', 'Chiudi', {
        duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
      });

      return;

    }

    this.acconti.push(element);

    this.snackBar.open('Acconto inserito', 'Chiudi', {
      duration: 1000, horizontalPosition: 'right', verticalPosition: 'bottom'
    });

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

  keyOrdine(o: any): string {
    return `${o.anno}/${o.serie}/${o.progressivo}`;
  }

  hasNonValidati(o: any): boolean {
    const k = this.keyOrdine(o);
    return (this.nonValidatiCountByKey[k] || 0) > 0;
  }

  apriNonValidatiPerOrdine(ordine: any) {

    this.ordineService.getAccontiNonValidatiByOrdine(
      ordine.anno,
      ordine.serie,
      ordine.progressivo
    ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (list) => {

          if (!list?.length) {
            this.snackBar.open('Nessun acconto non validato per questo ordine', 'Chiudi', { duration: 3000 });
            return;
          }

          this.dialog.open(AccontiNonValidatiDialogComponent, {
            width: '600px',
            data: list
          });

        },
        error: () => {
          this.snackBar.open('Errore nel recupero acconti non validati', 'Chiudi', { duration: 3000 });
        }
      });

  }

  chiudi(): void {
    this.dialogRef.close();
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

  nuovoAccontoIvatoStr?: string
  percentualeStr?: string
}
