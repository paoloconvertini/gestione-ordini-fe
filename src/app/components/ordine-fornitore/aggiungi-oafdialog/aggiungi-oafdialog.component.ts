import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BaseComponent} from "../../baseComponent";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Articolo} from "../../../models/Articolo";
import {OafArticoloService} from "../../../services/ordine-fornitore/dettaglio/oaf-articolo.service";
import {FiltroOafArticoli} from "../../../models/FiltroOafArticoli";
import {takeUntil} from "rxjs";

@Component({
  selector: 'app-aggiungi-oafdialog',
  templateUrl: './aggiungi-oafdialog.component.html',
  styleUrls: ['./aggiungi-oafdialog.component.css']
})
export class AggiungiOAFDialogComponent extends BaseComponent implements OnInit {

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<AggiungiOAFDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private service: OafArticoloService) {
    super();
  }

  rigoOafForm: any = FormGroup;
  rigo: number = 0;
  loader = false;
  loading = false;
  articoli:Articolo[] = [];
  filtro: FiltroOafArticoli = {codice: undefined, descrSuppl:undefined, descrizione: undefined};
  selectedArticolo: Articolo = new Articolo();

  submitForm() {
    this.dialogRef.close(this.rigoOafForm.value);
  }

  ngOnInit(): void {
    this.selectedArticolo.rigo = this.data.rigo + 1;
  }

  displayFn(articolo: Articolo) {
    if (articolo) { return articolo.articolo; }
  }

  displayFnDesc(articolo: Articolo) {
    if (articolo) { return articolo.descrArticolo; }
  }

  displayFnDescSuppl(articolo: Articolo) {
    if (articolo) { return articolo.descrArtSuppl; }
  }

  onType(cerca:string, from:number) {
    if (cerca.length < 3) {
      return;
    }
    if(from === 1){
      this.filtro.descrSuppl = undefined;
      this.filtro.codice = undefined;
    } else if(from === 2){
      this.filtro.descrizione = undefined;
      this.filtro.codice = undefined;
    } else {
      this.filtro.descrSuppl = undefined;
      this.filtro.descrizione = undefined;
    }
    this.service.search(this.filtro).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        this.loader = false;
        if (res && !res.error) {
          this.articoli = res;
        }
      },
      error: (e) => {
        console.error(e);
        this.loader = false;
      }
    });

  }

  settaArticolo(value: any) {
    this.selectedArticolo = value;
    this.selectedArticolo.rigo = this.data.rigo + 1;
  }

  save() {
    this.dialogRef.close(this.selectedArticolo);
  }
}
