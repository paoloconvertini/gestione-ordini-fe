import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-event-actions-dialog',
  templateUrl: './event-actions-dialog.component.html',
  styleUrls: ['./event-actions-dialog.component.css']
})
export class EventActionsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EventActionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  modifica() {
    this.dialogRef.close('modifica');
  }

  nuovo() {
    this.dialogRef.close('nuovo');
  }

  elimina() {
    this.dialogRef.close('elimina');
  }

  associaCliente() {
    this.dialogRef.close('associa');
  }

  close() {
    this.dialogRef.close();
  }
}
