import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {AccontoLight} from "../ordine-cliente/articolo/articolo.component";

@Component({
  selector: 'app-acconti-non-validati-dialog',
  templateUrl: './acconti-non-validati-dialog.component.html',
  styleUrls: ['./acconti-non-validati-dialog.component.css']
})
export class AccontiNonValidatiDialogComponent {
  cols = ['anno', 'serie', 'progressivo'];
  constructor(@Inject(MAT_DIALOG_DATA) public data: AccontoLight[]) {}
}
