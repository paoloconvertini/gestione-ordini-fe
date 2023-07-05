import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../../baseComponent";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OrdineClienteNotaDto} from "../../../models/OrdineClienteNotaDto";
import {OafArticolo} from "../../../models/OafArticolo";

@Component({
  selector: 'app-aggiungi-oafdialog',
  templateUrl: './aggiungi-oafdialog.component.html',
  styleUrls: ['./aggiungi-oafdialog.component.css']
})
export class AggiungiOAFDialogComponent extends BaseComponent implements OnInit {

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AggiungiOAFDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    super();
    this.rigo = data.rigo + 1;
  }

  rigoOafForm: any = FormGroup;
  rigo: number = 0;
  loader = false;

  submitForm() {
    this.dialogRef.close(this.rigoOafForm.value);
  }

  ngOnInit(): void {
    this.rigoOafForm = this.fb.group({
      rigo: new FormControl( this.rigo),
      tipoRigo: new FormControl(''),
      oarticolo: new FormControl(''),
      odescrArticolo: new FormControl(''),
      oquantita: new FormControl(''),
      ounitaMisura: new FormControl(''),
      oprezzo: new FormControl(''),
      fscontoArticolo: new FormControl(''),
      scontoF1: new FormControl(''),
      scontoF2: new FormControl(''),
      fscontoP: new FormControl('')
    });
  }


}
