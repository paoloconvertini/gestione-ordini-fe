import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrezzoArticolo } from '../../models/prezzo-articolo';

export interface RicaricoDeselezionatiData {
  articoli: PrezzoArticolo[];
  percentualePrincipale: number;
  numeroSelezionati: number;
}

export interface RicaricoDeselezionatiResult {
  applica: boolean;
  percentuale?: number;
}

@Component({
  selector: 'app-ricarico-deselezionati-dialog',
  templateUrl: './ricarico-deselezionati-dialog.component.html',
  styleUrls: ['./ricarico-deselezionati-dialog.component.css']
})
export class RicaricoDeselezionatiDialogComponent {
  percentuale: number | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: RicaricoDeselezionatiData,
              private dialogRef: MatDialogRef<RicaricoDeselezionatiDialogComponent, RicaricoDeselezionatiResult>) {}

  get percentualeValida(): boolean {
    return this.percentuale !== null && Number.isFinite(this.percentuale)
      && this.percentuale >= 0 && this.percentuale <= 10000
      && Math.abs(this.percentuale * 10000 - Math.round(this.percentuale * 10000)) < 0.00001;
  }

  soloSelezionati(): void {
    this.dialogRef.close({ applica: false });
  }

  applicaAncheDeselezionati(): void {
    if (this.percentualeValida && this.percentuale !== null) {
      this.dialogRef.close({ applica: true, percentuale: this.percentuale });
    }
  }

  annulla(): void {
    this.dialogRef.close();
  }
}
