import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-motivo-dialog',
  templateUrl: './motivo-dialog.component.html',
  styleUrls: ['./motivo-dialog.component.css']
})
export class MotivoDialogComponent {

  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MotivoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data?.motivo;

    this.form = this.fb.group({
      descrizione: [
        data?.motivo?.descrizione || '',
        [Validators.required, Validators.maxLength(150)]
      ]
    });
  }

  save() {
    if (this.form.invalid) return;

    this.dialogRef.close({
      descrizione: this.form.value.descrizione,
      parentId: this.data?.parentId ?? null
    });
  }

  close() {
    this.dialogRef.close();
  }
}
