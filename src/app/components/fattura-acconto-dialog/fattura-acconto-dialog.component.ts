import {Component, Inject} from '@angular/core';
import {Observable, Observer} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

export interface DialogData {
  ordini: any;
}

@Component({
  selector: 'app-fattura-acconto-dialog',
  templateUrl: './fattura-acconto-dialog.component.html',
  styleUrls: ['./fattura-acconto-dialog.component.css']
})
export class FatturaAccontoDialogComponent {
  ordini: any = [];
  maxIva22: number = 0;
  maxIva10: number = 0;
  output: any;


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dialogRef: MatDialogRef<FatturaAccontoDialogComponent>) {
  }

  getOrdine(){

  }

  calcolaIva22 () {
    this.maxIva22 = this.output.importo - this.output.iva10;
  }

  calcolaIva10 () {
    this.maxIva10 = this.output.importo - this.output.iva22;
  }

  submitForm() {
    this.dialogRef.close(this.output);
  }


  chiudi() {
    this.dialogRef.close();
  }

}
