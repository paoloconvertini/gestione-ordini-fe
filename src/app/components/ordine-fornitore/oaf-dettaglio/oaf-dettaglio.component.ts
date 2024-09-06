import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OafArticoloService} from "../../../services/ordine-fornitore/dettaglio/oaf-articolo.service";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {takeUntil} from "rxjs";
import {OrdineFornitoreDettaglio} from "../../../models/ordine-fornitore-dettaglio";
import {AggiungiOAFDialogComponent} from "../aggiungi-oafdialog/aggiungi-oafdialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {
  AggiornaDataConsegnaDialogComponent
} from "../../aggiorna-data-consegna-dialog/aggiorna-data-consegna-dialog.component";

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
  rigo: number = 0;
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo', 'sconto', 'prezzoTot', 'azioni'];
  ordineFornitoreDettaglio: OrdineFornitoreDettaglio = new OrdineFornitoreDettaglio();
  filtro: FiltroOrdini = new FiltroOrdini();
  modificato: boolean = false;

  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
      this.anno = params.anno;
      this.serie = params.serie;
      this.progressivo = params.progressivo;
      this.status = params.status?params.status:undefined;
    });
    this.getOafArticoliByOrdineId(this.anno, this.serie, this.progressivo);
  }

  constructor(private snackbar: MatSnackBar, private oafService: OrdineFornitoreService, private service: OafArticoloService, private dialog: MatDialog, private route: Router, private router: ActivatedRoute) {
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

  annulla() {
    let url = '/ordini-fornitore';
    if(this.status) {
      url += '/' + this.status;
    }
      this.route.navigateByUrl(url);
  }

  aggiungiRigo(articolo: any) {
    const dialogRef = this.dialog.open(AggiungiOAFDialogComponent, {
      width: '80%',
      data:{rigo: articolo.rigo}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true
        result.anno = this.anno;
        result.serie = this.serie;
        result.progressivo = this.progressivo;
        this.service.salvaOafArticoli(result).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              if (!res.error) {
                this.getOafArticoliByOrdineId(this.anno, this.serie, this.progressivo);
              } else {
                this.loader = false;
                this.snackbar.open(res.msg, 'Chiudi', {
                  duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
            },
            error: (e) => {
              console.error(e);
              this.loader = false;
              this.snackbar.open('Errore! Riga non creata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
            }
          });
      }
    });
  }

  getOafArticoliByOrdineId(anno: any, serie: any, progressivo: any): void {
    this.loader = true;
      this.service.getOafArticoliByOrdineId(anno, serie, progressivo)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (data: OrdineFornitoreDettaglio | undefined) => {
            if(data) {
              this.ordineFornitoreDettaglio = data;
              if(this.ordineFornitoreDettaglio.articoli && this.ordineFornitoreDettaglio.articoli.length > 0) {
                this.ordineFornitoreDettaglio.articoli.forEach(a => this.calcolaTotale(a));
               this.rigo = this.ordineFornitoreDettaglio.articoli[this.ordineFornitoreDettaglio.articoli.length -1].rigo;
              }
              this.createPaginator(this.ordineFornitoreDettaglio.articoli, 100);
              if(this.filtro.searchText){
                this.applyFilter();
              }
            }
            this.modificato = false;
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
  }

  approva(): void {
    this.loader = true;
    this.service.approvaOrdine(this.anno, this.serie, this.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
      next: (res) => {
        this.loader = false;
        if(!res.error) {
          this.route.navigate(['/ordini-fornitore'])
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

  salva() {
    this.modificato = false;
    this.updateOafArticoli(this.anno, this.serie, this.progressivo, this.dataSource.filteredData);
  }

  richiediApprovazione() {
    if(this.modificato) {
      this.snackbar.open('ATTENZIONE: articoli modificati senza salvare!!', 'Chiudi', {
        duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
      })
      return;
    }
    let data:any = [];
    this.dataSource.filteredData.forEach(d => data.push(d));
    data.forEach((d:any) => delete d["prezzoTot"]);
    this.oafService.richiediOafApprovazioneArticoli(this.anno, this.serie, this.progressivo, data).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (!res.error) {
            this.route.navigate(['/ordini-fornitore', 'T']);
          }
        }
      });
  }

  calcolaTotale(articolo: any) {
    this.modificato = true;
    articolo.prezzoTot = 0;
    let prezzo = articolo.oprezzo;
    if(articolo.fscontoArticolo) {
      prezzo = (prezzo - (prezzo*(articolo.fscontoArticolo/100)));
    }
    if(articolo.scontoF1) {
      prezzo = (prezzo - (prezzo*(articolo.scontoF1/100)));
    }
    if(articolo.scontoF2) {
      prezzo = (prezzo - (prezzo*(articolo.scontoF2/100)));
    }
    if(articolo.fscontoP) {
      prezzo = (prezzo - (prezzo*(articolo.fscontoP/100)));
    }
    articolo.prezzoTot = prezzo * articolo.oquantita;
    this.ordineFornitoreDettaglio.totale = 0;
    this.ordineFornitoreDettaglio.articoli?.forEach(a => this.ordineFornitoreDettaglio.totale += a.prezzoTot);
  }

  elimina(articolo:any) {
    this.openConfirmDialog('', '', articolo);
  }

  openConfirmDialog(extraProp: any, preProp: any, articolo: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += "Sei sicuro di voler eliminare l'articolo";
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
        this.loader = true;
        this.service.eliminaArticolo(articolo.anno, articolo.serie, articolo.progressivo, articolo.rigo).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Articolo eliminato', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
              this.getOafArticoliByOrdineId(articolo.anno, articolo.serie, articolo.progressivo);
            },
            error: (e) => {
              console.error(e);
              this.snackbar.open('Errore!', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
              this.loader = false;
            }
          });
      }
    });
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

  inerisciDataConsegna(articolo: any) {
    const dialog = this.dialog.open(AggiornaDataConsegnaDialogComponent, {
      width: '70%',
      data: {pid: articolo.pid},
    });
    dialog.afterClosed().subscribe(result => {
      if(result) {
        this.getOafArticoliByOrdineId(articolo.anno, articolo.serie, articolo.progressivo);
      }
    });
  }
}
