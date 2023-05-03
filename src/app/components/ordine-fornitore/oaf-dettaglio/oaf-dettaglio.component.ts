import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OafArticoloService} from "../../../services/ordine-fornitore/dettaglio/oaf-articolo.service";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {takeUntil} from "rxjs";

@Component({
  selector: 'app-oaf-dettaglio',
  templateUrl: './oaf-dettaglio.component.html',
  styleUrls: ['./oaf-dettaglio.component.css']
})
export class OafDettaglioComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  anno: any;
  serie: any;
  progressivo: any;
  status: any;
  totale: number = 0;
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo', 'azioni'];

  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
      this.anno = params.anno;
      this.serie = params.serie;
      this.progressivo = params.progressivo;
      this.status = params.status;
    });
    this.getOafArticoliByOrdineId(this.anno, this.serie, this.progressivo);
  }

  constructor(private oafService: OrdineFornitoreService, private service: OafArticoloService, private dialog: MatDialog, private route: Router, private router: ActivatedRoute) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    if (localStorage.getItem(environment.MAGAZZINIERE)) {
      this.isMagazziniere = true;
    }
    if (localStorage.getItem(environment.AMMINISTRATIVO)) {
      this.isAmministrativo = true;
    }
    if (localStorage.getItem(environment.VENDITORE)) {
      this.isVenditore = true;
    }
  }

  getOafArticoliByOrdineId(anno: any, serie: any, progressivo: any): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getOafArticoliByOrdineId(anno, serie, progressivo)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (data: any[] | undefined) => {
            if(data) {
              data.forEach(d => {
                this.totale += d.oprezzo;
              })
              this.articoli = data;
              this.createPaginator(data);
            }
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

  approva(): void {
    this.loader = true;
    this.service.approvaOrdine(this.anno, this.serie, this.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
      next: (res) => {
        this.loader = false;
        if(!res.error) {
          this.route.navigate(['/ordini-fornitore', 'APPROVATO'])
        }
      }, error: (e) => {
        console.error(e);
        this.loader = false;
      }
    })
  }

  updateOafArticoli(anno: any, serie: any, progressivo: any, data: any): void {
    this.loader = true;
    this.service.update(data).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getOafArticoliByOrdineId(anno, serie, progressivo);
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  salvaOrdine() {
    this.updateOafArticoli(this.anno, this.serie, this.progressivo, this.dataSource.filteredData);
  }

}
