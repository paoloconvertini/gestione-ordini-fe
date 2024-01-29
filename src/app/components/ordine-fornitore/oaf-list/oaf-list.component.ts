import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {takeUntil} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SelectionModel} from "@angular/cdk/collections";
import {WarnDialogComponent} from "../../warn-dialog/warn-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrdineClienteNotaDto} from "../../../models/OrdineClienteNotaDto";
import {OrdineClienteNoteDialogComponent} from "../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {FiltroOrdini} from "../../../models/FiltroOrdini";

@Component({
  selector: 'app-oaf-list',
  templateUrl: './oaf-list.component.html',
  styleUrls: ['./oaf-list.component.css']
})
export class OafListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['select', 'numero', 'fornitore', 'data', 'dataModifica', 'flInviato', 'azioni'];
  status?: string;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  selection = new SelectionModel<any>(true, []);
  updateList: any = [];
  filtro: FiltroOrdini = new FiltroOrdini();

  constructor(private snackbar: MatSnackBar, private router: ActivatedRoute, private dialog: MatDialog, private service: OrdineFornitoreService, private route: Router) {
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


  ngOnInit(): void {
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
        if (params.status) {
          this.status = params.status;
        }
        this.retrieveFornitoreList(this.status);
      }
    );

  }

  updateOaf(): void {
    if(this.updateList.length === 0){
      return;
    }
    this.loader = true;
    this.service.updateOaf(this.updateList).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.retrieveFornitoreList(this.status);
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  aggiungiNote(ordine: any) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    data.note = ordine.note;
    {
      const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
        width: '50%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loader = true;
          this.service.addNotes(result).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                  ordine.note = result.note;
                }
              },
              error: (e) => {
                console.error(e);
                this.snackbar.open('Errore! Nota non creata', 'Chiudi', {
                  duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
                })
                this.loader = false;
              }
            });
        }
      });
    }
  }

  unisciOrdini() {
    this.loader = true;
    this.service.unisciOrdini(this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loader = false;
          this.retrieveFornitoreList(this.status);
        }
      })
  }

  retrieveFornitoreList(status: any): void {
    this.loader = true;
    this.updateList = [];
      this.service.getAllOaf(status)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 15);
          if(this.filtro.searchText){
            this.applyFilter();
          }
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  refreshPage() {
    this.retrieveFornitoreList(this.status);
  }

  apriDettaglio(ordine: OrdineCliente) {
    let url = "/oaf/articoli/" + ordine.anno
      + "/" + ordine.serie + "/" + ordine.progressivo;
    if (this.status) {
      url += "/" + this.status
    }
    this.route.navigateByUrl(url);
  }

  apri(ordine: any) {
    this.openConfirmDialogApri('', '', ordine);
  }

  elimina(ordine: any) {
    this.openConfirmDialog('', '', ordine);
  }

  openConfirmDialog(extraProp: any, preProp: any, ordine: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += "Sei sicuro di voler eliminare l'ordine";
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
        this.service.eliminaOrdine(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Ordine eliminato', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
              this.retrieveFornitoreList(this.status);
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

  openConfirmDialogApri(extraProp: any, preProp: any, ordine: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += "Sei sicuro di voler riaprire l'ordine";
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
        this.service.apriOrdine(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Ordine riaperto', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
              this.status = "F";
              this.apriDettaglio(ordine);
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

  downloadOrdine(ordine: any) {
    this.service.download(ordine);
  }

  aggiungiLista(ordine: any) {
    if(this.updateList.includes(ordine)){
      this.updateList.splice(ordine, 1);
    } else {
      this.updateList.push(ordine);
    }

  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.intestazione.toLowerCase().includes(filter)
        || data.serie.toLowerCase().includes(filter)
        || data.dataOrdine.includes(filter)
        || data.anno.toString().toLowerCase().includes(filter)
        || data.progressivo.toString().toLowerCase().includes(filter)
      )
    }
  }
}
