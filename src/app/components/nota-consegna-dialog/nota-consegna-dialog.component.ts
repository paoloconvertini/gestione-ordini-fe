import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-nota-consegna-dialog',
  templateUrl: './nota-consegna-dialog.component.html',
  styleUrls: ['./nota-consegna-dialog.component.css']
})
export class NotaConsegnaDialogComponent {

  nota: string = '';

  constructor(
    public dialogRef: MatDialogRef<NotaConsegnaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.nota = data.nota || '';
  }

}
