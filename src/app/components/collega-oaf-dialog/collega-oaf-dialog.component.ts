import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PianocontiService} from "../../services/pianoconti/pianoconti.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {takeUntil} from "rxjs";

interface DialogData {
  descrArticolo: string;
}

@Component({
  selector: 'app-collega-oaf-dialog',
  templateUrl: './collega-oaf-dialog.component.html',
  styleUrls: ['./collega-oaf-dialog.component.css']
})
export class CollegaOAFDialogComponent implements OnInit{
  descr: any;
  collegaOAFForm: any = FormGroup;
  output: any = {};
  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<CollegaOAFDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    this.descr = this.data;
    this.collegaOAFForm = this.fb.group({
      annoOAF: new FormControl('', Validators.required),
      serieOAF: new FormControl('', Validators.required),
      progressivoOAF: new FormControl('', Validators.required),
    });
  }
  submitForm() {
    this.dialogRef.close(this.collegaOAFForm.value);
  }


  chiudi() {
    this.dialogRef.close();
  }

}
