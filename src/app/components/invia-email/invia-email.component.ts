import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";

export interface DialogData {
  email: string;
  update: boolean;
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
  update: boolean = false;
  showUpdate: boolean = false;

  constructor(private dialogRef: MatDialogRef<InviaEmailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (data.email) {
      this.to.setValue(data.email);
    }
    if(data.update) {
      this.showUpdate = data.update;
    }
  }

  submitForm() {
    if (this.form.valid) {
      this.dialogRef.close({'to': this.to.value, 'update': this.update});
    }
  }

  get to(): FormControl {
    return this.form.get('to') as FormControl;
  }

}
