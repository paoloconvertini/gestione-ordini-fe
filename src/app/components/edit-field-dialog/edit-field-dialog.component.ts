import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EditFieldDialogData {
  title: string;
  value: any;
  type: 'text' | 'number' | 'textarea';
}

@Component({
  selector: 'app-edit-field-dialog',
  templateUrl: './edit-field-dialog.component.html',
  styleUrls: ['./edit-field-dialog.component.css']
})
export class EditFieldDialogComponent {

  value: any;

  constructor(
    public dialogRef: MatDialogRef<EditFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditFieldDialogData
  ) {
    this.value = data.value;
  }

  salva() {
    this.dialogRef.close(this.value);
  }

  annulla() {
    this.dialogRef.close();
  }
}
