import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-invia-email',
  templateUrl: './invia-email.component.html',
  styleUrls: ['./invia-email.component.css']
})
export class InviaEmailComponent {
  form = new FormGroup({
    to: new FormControl(null, [Validators.required, Validators.email]),
  });

  constructor(private dialogRef: MatDialogRef<InviaEmailComponent>) {
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
