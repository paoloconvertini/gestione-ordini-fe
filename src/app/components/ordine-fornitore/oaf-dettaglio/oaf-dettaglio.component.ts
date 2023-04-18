import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OafArticoloService} from "../../../services/ordine-fornitore/dettaglio/oaf-articolo.service";
import {Observable} from "rxjs";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";

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

  constructor(private oafService: OrdineFornitoreService, private service: OafArticoloService, dialog: MatDialog, snackbar: MatSnackBar, route: Router, private router: ActivatedRoute) {
    super(dialog, snackbar, route);
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
        .subscribe({
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
    this.service.approvaOrdine(this.anno, this.serie, this.progressivo).subscribe({
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
    this.service.update(data)
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getOafArticoliByOrdineId(anno, serie, progressivo, );
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

  richiediApprovazione() {
    let data = {
      anno: this.anno,
      serie: this.serie,
      progressivo: this.progressivo,

    }
    this.openConfirmDialog(null, null);
  }

  openConfirmDialog(extraProp: any, preProp: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di aver processato correttamente tutti gli articoli';
    if (extraProp) {
      msg += " ";
      msg += extraProp;
    }
    msg += '?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.oafService.richiediOafApprovazione(this.anno, this.serie, this.progressivo).subscribe({
          next: (res) => {
            if (!res.error) {
              this.route.navigate(['/ordini-fornitore', 'DA_APPROVARE']);
            }
          },
          error: (e) => console.error(e)
        });
      }
    });
  }
}
