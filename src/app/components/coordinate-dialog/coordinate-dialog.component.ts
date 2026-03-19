import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-coordinate-dialog',
  templateUrl: './coordinate-dialog.component.html',
  styleUrls: ['./coordinate-dialog.component.css']
})
export class CoordinateDialogComponent {

  coords: string = '';

  constructor(
    public dialogRef: MatDialogRef<CoordinateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  openMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.data.indirizzo)}`;
    window.open(url, '_blank');
  }

  confirm() {
    if (!this.coords) return;
    this.dialogRef.close({
      coords: this.coords
    });
  }

  close() {
    this.dialogRef.close();
  }
}
