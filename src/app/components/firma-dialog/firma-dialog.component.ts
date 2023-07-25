import { Component, ViewChild  } from '@angular/core';
import SignaturePad from 'signature_pad';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-firma-dialog',
  templateUrl: './firma-dialog.component.html',
  styleUrls: ['./firma-dialog.component.css']
})
export class FirmaDialogComponent {

  constructor(private dialogRef: MatDialogRef<FirmaDialogComponent>) {
  }

  signPad: any;
  @ViewChild('signPadCanvas', {static: false}) signaturePadElement:any;
  signImage:any;

  ngAfterViewInit() {
    this.signPad = new SignaturePad(this.signaturePadElement.nativeElement);
    this.signPad.minWidth = 0.5;
    this.signPad.maxWidth = 1;

  }
  /*Clean whole the signature*/
  clearSignPad() {
    this.signPad.clear();
  }
  /*Here you can save the signature as a Image*/
  saveSignPad() {
    this.dialogRef.close(this.signPad.toDataURL());
  }

}
