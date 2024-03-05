import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

export interface DialogData {
  msg: string;
  data: [];
}

@Component({
  selector: 'app-warn-dialog',
  templateUrl: './warn-dialog.component.html',
  styleUrls: ['./warn-dialog.component.css']
})
export class WarnDialogComponent {
  constructor(public dialogRef: MatDialogRef<WarnDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData){
  }

  onNoClick(): void {
    this.dialogRef.close(true);
  }

}
