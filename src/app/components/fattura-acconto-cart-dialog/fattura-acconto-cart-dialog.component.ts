import {Component, Inject} from '@angular/core';
import {AccontoIva} from "../fattura-acconto-dialog/fattura-acconto-dialog.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-fattura-acconto-cart-dialog',
  templateUrl: './fattura-acconto-cart-dialog.component.html',
  styleUrls: ['./fattura-acconto-cart-dialog.component.css']
})
export class FatturaAccontoCartDialogComponent {

  acconti: AccontoIva[] = [];
  intestazione: any;
  sottoConto: any;
  totaleIvato: number = 0;


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
              private dialogRef: MatDialogRef<FatturaAccontoCartDialogComponent>) {
    this.acconti = data.acconti;
    this.intestazione = data.intestazione;
    this.sottoConto = data.sottoConto;
    this.calcolaTotale();
  }

  conferma() {
    this.dialogRef.close(true);
  }

  rimuovi(index: number){
    if (index >= 0 && index < this.acconti.length) {
      this.acconti.splice(index, 1);
    }
    this.calcolaTotale();
  }

  calcolaTotale(){
    this.totaleIvato = 0;
    this.acconti.forEach((a: any)=> {
      this.totaleIvato += a.nuovoAccontoIvato;
    })
  }

}

export interface DialogData {
  acconti: AccontoIva[];
  intestazione: any;
  sottoConto: any;
}
