import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";

export interface DialogData {
  email: string;
}

@Component({
  selector: 'app-invia-email',
  templateUrl: './invia-email.component.html',
  styleUrls: ['./invia-email.component.css']
})
export class InviaEmailComponent {
  form = new FormGroup({
    to: new FormControl(null, [Validators.required, Validators.email]),
  });

  constructor(private dialogRef: MatDialogRef<InviaEmailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (data.email) {
      this.to.setValue(data.email);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.form.valid) {
      this.dialogRef.close(this.to.value);
    }
  }

  get to(): FormControl {
    return this.form.get('to') as FormControl;
  }

}
