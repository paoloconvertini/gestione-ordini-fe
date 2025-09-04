import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import {FatturaAccontoCartDialogComponent} from "../fattura-acconto-cart-dialog/fattura-acconto-cart-dialog.component";
import {forkJoin, Observable, takeUntil} from 'rxjs';
import {ArticoloService} from "../../services/ordine-cliente/articolo/articolo.service";
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
export class FatturaAccontoDialogComponent extends BaseComponent  implements OnInit {
  ordini: any = [];
  acconti: AccontoIva[] = [];
  intestazione: any;
  sottoConto: any;
  tabSelezionato = 0; // primo tab aperto di default
  nonValidatiCountByKey: Record<string, number> = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private ordineService: OrdineClienteService,
              private dialogRef: MatDialogRef<FatturaAccontoDialogComponent>,
              private snackBar: MatSnackBar, private dialog: MatDialog) {
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
        },
        error: () => {
          this.snackBar.open('Errore nel controllo acconti non validati', 'Chiudi', {
            duration: 3000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });
    }
  }

  calcolaIva (row: any) {
    row.nuovoAccontoIvato = (row.residuoFatturabileIvato * row.percentuale/100);
    row.nuovoAcconto = (row.residuoFatturabile  * row.percentuale/100);
    row.aSaldo = row.percentuale === 100;
  }

  aggiungi(iva: any, ordine: any) {
    let element = {
      aSaldo: iva.aSaldo,
      iva: iva.fcodiceIva,
      nuovoAccontoIvato: iva.nuovoAccontoIvato,
      nuovoAcconto: iva.nuovoAcconto,
      anno: ordine.anno,
      serie: ordine.serie,
      progressivo: ordine.progressivo,
      contoCliente: this.sottoConto
    };
    if(this.acconti.length > 0){
      let errore = false;
      this.acconti.forEach((a : AccontoIva) => {
        if(a.iva === element.iva && a.anno === element.anno && a.serie === element.serie && a.progressivo === element.progressivo){
          this.snackBar.open('ATTENZIONE! Acconto già inserito', 'Chiudi', {
            duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
          })
          errore = true;
          return;
        }
      })
      if(!errore) {
        this.acconti.push(element);
        this.snackBar.open('Acconto inserito', 'Chiudi', {
          duration: 1000, horizontalPosition: 'right', verticalPosition: 'bottom'
        })
      }
    } else {
      this.acconti.push(element);
      this.snackBar.open('Acconto inserito', 'Chiudi', {
        duration: 1000, horizontalPosition: 'right', verticalPosition: 'bottom'
      })
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


  chiudi() {
    this.dialogRef.close();
  }

  calcolaPercentuale(iva: any, saldo: boolean) {
    if(saldo) {
      iva.nuovoAccontoIvato = iva.residuoFatturabileIvato;
      iva.nuovoAcconto = iva.residuoFatturabile;
      iva.percentuale = 100;
    } else {
      iva.percentuale = iva.nuovoAccontoIvato/iva.residuoFatturabileIvato*100;
      iva.nuovoAcconto = (iva.residuoFatturabile  * iva.percentuale/100);
    }
    iva.aSaldo = iva.percentuale === 100;
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

}
