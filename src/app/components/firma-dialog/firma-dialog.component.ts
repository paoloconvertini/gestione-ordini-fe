import {AfterViewInit, Component, ViewChild} from '@angular/core';
import SignaturePad from 'signature_pad';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-firma-dialog',
  templateUrl: './firma-dialog.component.html',
  styleUrls: ['./firma-dialog.component.css']
})
export class FirmaDialogComponent implements AfterViewInit{

  constructor(private dialogRef: MatDialogRef<FirmaDialogComponent>) {
  }

  @ViewChild('signPadCanvas', {static: false}) signaturePadElement:any;
  signPad: any;

  ngAfterViewInit() {
    const canvas = this.signaturePadElement.nativeElement;

    setTimeout(() => this.resizeCanvas(), 0);

    this.signPad = new SignaturePad(canvas, {
      minWidth: 1.5,
      maxWidth: 3,
      penColor: '#000'
    });
    this.signPad.velocityFilterWeight = 0.7;
    this.signPad.throttle = 16;

    canvas.style.touchAction = 'none';
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const canvas = this.signaturePadElement.nativeElement;

    const data = this.signPad ? this.signPad.toData() : null;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    if (this.signPad) {
      this.signPad.clear();
      if (data) {
        this.signPad.fromData(data);
      }
    }
  }

  clearSignPad() {
    this.signPad.clear();
  }

  saveSignPad() {
    this.dialogRef.close(this.signPad.toDataURL());
  }

}
