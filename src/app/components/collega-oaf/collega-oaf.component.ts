import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {takeUntil} from "rxjs";
import {OrdineFornitoreDettaglio} from "../../models/ordine-fornitore-dettaglio";
import {CommonListComponent} from "../commonListComponent";
import {OafArticoloService} from "../../services/ordine-fornitore/dettaglio/oaf-articolo.service";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {SelectionModel} from "@angular/cdk/collections";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-collega-oaf',
  templateUrl: './collega-oaf.component.html',
  styleUrls: ['./collega-oaf.component.css']
})
export class CollegaOAFComponent extends CommonListComponent implements OnInit{
  descr: any;
  collegaOAFForm: any = FormGroup;
  output: any = {};
  oafDetail: any = FormGroup;
  anno: any;
  serie: any;
  progressivo: any;
  progrGenerale: any;
  annoOAF: any;
  serieOAF: any;
  progressivoOAF: any;
  selection = new SelectionModel<any>(false, []);
  displayedColumns: string[] = ['select', 'codice', 'descrizione', 'quantita', 'prezzo', 'sconto', 'prezzoTot'];
  ordineFornitoreDettaglio: OrdineFornitoreDettaglio = new OrdineFornitoreDettaglio();
  filtro: FiltroOrdini = new FiltroOrdini();
  constructor(private route: Router, private snackbar: MatSnackBar, private service: OafArticoloService, private fb: FormBuilder, private router: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
      this.progrGenerale = params.progrGenerale;
      this.anno = params.anno;
      this.progressivo = params.progressivo;
      this.serie = params.serie;
    });
    this.collegaOAFForm = this.fb.group({
      annoOAF: new FormControl('', Validators.required),
      serieOAF: new FormControl('', Validators.required),
      progressivoOAF: new FormControl('', Validators.required),
    });
  }
  submitForm() {
    this.annoOAF = this.collegaOAFForm.value.annoOAF;
    this.serieOAF = this.collegaOAFForm.value.serieOAF;
    this.progressivoOAF = this.collegaOAFForm.value.progressivoOAF;
    this.getOafArticoliByOrdineId(this.annoOAF, this.serieOAF, this.progressivoOAF);
  }

  getOafArticoliByOrdineId(anno: any, serie: any, progressivo: any): void {
    this.loader = true;
    this.service.getOafArticoliByOrdineId(anno, serie, progressivo)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: OrdineFornitoreDettaglio | undefined) => {
        if(data) {
          this.ordineFornitoreDettaglio = data;
          this.createPaginator(this.ordineFornitoreDettaglio.articoli, 100);
          if(this.filtro.searchText){
            this.applyFilter();
          }
        }
        this.loader = false;
      }
    })
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.tipoRigo !=='C' &&
        (data.oarticolo.toLowerCase().includes(filter)
          || data.odescrArticolo.toLowerCase().includes(filter))
      )
    }
  }

  salva() {
    this.loader = true;
    this.service.collegaOAF(this.progrGenerale, this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
            this.loader = false;
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
            })
          let url = "/articoli/edit/" + this.anno + "/" + this.serie + "/" + this.progressivo;
          this.route.navigateByUrl(url);
        }
      });
  }

}
