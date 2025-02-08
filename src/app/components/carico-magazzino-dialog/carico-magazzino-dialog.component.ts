import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CommonListComponent} from "../commonListComponent";
import {map, Observable, startWith, takeUntil} from "rxjs";
import {SaldiMagazzinoService} from "../../services/saldi-magazzino/saldi-magazzino.service";
import {Dizionario} from "../../models/Dizionario";

@Component({
  selector: 'app-carico-magazzino-dialog',
  templateUrl: './carico-magazzino-dialog.component.html',
  styleUrls: ['./carico-magazzino-dialog.component.css']
})
export class CaricoMagazzinoDialogComponent extends CommonListComponent implements OnInit{

  caricoMagForm: any = FormGroup;
  output: any = {};
  vettori: Dizionario[] = [];
  causali: Dizionario[] = [];

  constructor(private service: SaldiMagazzinoService, private fb: FormBuilder, private dialogRef: MatDialogRef<CaricoMagazzinoDialogComponent>) {
    super();
  }

  ngOnInit(): void {
    this.caricoMagForm = this.fb.group({
      numDoc: new FormControl('', Validators.required),
      dataOperazione: new FormControl('', Validators.required),
      causale: new FormControl('', Validators.required),
      vettore: new FormControl('', Validators.required),
    });

    this.loadVettore();
    this.loadCausale();
  }

  loadVettore() {
    this.loader = true;
    this.service.getVettori().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.vettori = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  loadCausale(){
    this.loader = true;
    this.service.getCausali().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.causali = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  submitForm() {
    this.dialogRef.close(this.caricoMagForm.value);
  }


  chiudi() {
    this.dialogRef.close();
  }

}
