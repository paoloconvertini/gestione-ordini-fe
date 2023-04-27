import {Component, Input, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../../services/ordine-cliente/articolo/articolo.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {HistoryDialogComponent} from "../../history-dialog/history-dialog.component";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {OrdineClienteService} from "../../../services/ordine-cliente/list/ordine-cliente.service";
import {WarnDialogComponent} from "../../warn-dialog/warn-dialog.component";
import {AddFornitoreDialogComponent} from "../../add-fornitore-dialog/add-fornitore-dialog.component";
import {takeUntil} from "rxjs";
import {OrdineDettaglio} from "../../../models/ordine-dettaglio";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Bolla} from "../../../models/Bolla";

export interface Option {
  name: string,
  checked: boolean
}

@Component({
  selector: 'app-articolo',
  templateUrl: './articolo.component.html',
  styleUrls: ['./articolo.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ArticoloComponent extends CommonListComponent implements OnInit
//  , OnDestroy
{

  //subscription!: Subscription;
  @Input()
  soloVisualizza: any;
  user: any;
  locked: boolean = false;
  loaderBolle: boolean = false;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  anno: any;
  serie: any;
  progressivo: any;
  status: any;
  totale: number = 0;
  sottoConto: string = '';
  intestazione: string = '';
  filtroArticoli: boolean = false;
  filtroConsegnati: string = '';
  filtroDaRiservare: boolean = false;
  bolle: Bolla[] = [];
  radioOptions: Option[] = [{name: "Da ordinare", checked: true}, {name: "Tutti", checked: false}];
  radioConsegnatoOptions: Option[] = [{name: "Da consegnare", checked: true}, {
    name: "Consegnato",
    checked: false
  }, {name: "Tutti", checked: false}];
  radioDaRiservareOptions: Option[] = [{name: "Da riservare", checked: true}, {name: "Tutti", checked: false}];
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita'];
  expandedElement: any;
  userLock: any;


  ngOnInit(): void {
    this.soloVisualizza = this.route.url.includes('view');
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      this.anno = params.anno;
      this.serie = params.serie;
      this.progressivo = params.progressivo;
      this.status = params.status;
    });
    if (this.isAmministrativo && this.status === 'DA_ORDINARE') {
      this.filtroArticoli = true;
    }
    /* this.subscription = timer(0, 5000).pipe(
       switchMap( () =>
         this.service.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli)))
       .subscribe(result => console.log(result)
     )*/
    if (this.status === 'COMPLETO' || this.status === 'INCOMPLETO') {
      this.filtroConsegnati = 'Da consegnare';
    }
    if (this.status === 'INCOMPLETO' && this.isMagazziniere) {
      this.filtroDaRiservare = true;
    }
    this.user = localStorage.getItem(environment.USERNAME);
    this.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli, this.filtroConsegnati, this.filtroDaRiservare);
  }

  constructor(private ordineService: OrdineClienteService, private ordineFornitoreService: OrdineFornitoreService, private service: ArticoloService, private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router, private router: ActivatedRoute) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
      this.displayedColumns = [...this.displayedColumns, 'qtaConsegnatoSenzaBolla'];
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
    this.displayedColumns = [...this.displayedColumns, 'prezzo', 'prezzoTot', 'tono',
      'flRiservato', 'flDisponibile', 'flOrdinato', 'flConsegnato', 'azioni']
  }

  /*ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }*/

  salvaOrdine() {
    this.updateArticoli(this.anno, this.serie, this.progressivo, this.dataSource.filteredData, this.filtroArticoli);
  }

  getBolle(progrCliente: any) {
    this.loaderBolle = true;
    this.service.getBolle(progrCliente).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: any) => {
        this.loaderBolle = false;
        this.bolle = data;
      },
      error: (e: any) => {
        console.error(e);
        this.loaderBolle = false;
      }
    });
  }

  showHistory(articolo: any) {
    this.dialog.open(HistoryDialogComponent, {
      width: '65%',
      data: articolo,
      autoFocus: false,
      maxHeight: '90vh' //you can adjust the value as per your view
    });
  }

  chiudiOrdine() {
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
        this.service.chiudi(this.dataSource.filteredData).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (res) => {
            if (!res.error) {
              let url = '/ordini-clienti';
              if (res.msg) {
                url += '/' + res.msg;
              }
              this.route.navigate([url]);
            }
          },
          error: (e) => console.error(e)
        });
      }
    });
  }

  checkFlags(articolo: any, from: number) {
    if (from === 1) {
      if (articolo.geFlagNonDisponibile) {
        articolo.geFlagNonDisponibile = false;
      }
    } else if (from === 2) {
      if (articolo.geFlagRiservato) {
        articolo.geFlagRiservato = false;
      }
    }
  }

  apriFirma() {
    let ordineId = this.anno + '_' +
      this.serie + '_' + this.progressivo;
    {
      const dialogRef = this.dialog.open(FirmaDialogComponent, {
        width: '30%'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let data = new FormData();
          data.append('file', result);
          data.append('orderId', ordineId);
          this.loader = true;
          this.ordineService.upload(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Ordine firmato. Puoi trovare il pdf nella cartella condivisa', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
              this.route.navigate(['/ordini-clienti']);
            },
            error: (e) => {
              console.error(e);
              this.snackbar.open('Errore! Firma non creata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
              this.loader = false;
            }
          });
        }
      });
    }
  }

  creaOrdineForn() {
    this.loader = true;
    this.ordineFornitoreService.creaOrdineFornitori(this.anno, this.serie, this.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && res instanceof Array) {
            const dialogRef = this.dialog.open(WarnDialogComponent, {
              width: '30%',
              data: res
            });
            dialogRef.afterClosed().subscribe(result => {

            });
            this.route.navigate(['/ordini-clienti', 'DA_ORDINARE']);
          } else if (res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: () => {
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
        }
      })
  }

  addFornitore(codice: any): void {
    const dialogRef = this.dialog.open(AddFornitoreDialogComponent, {
      width: '30%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true;
        result.codiceArticolo = codice;
        this.service.addFornitoreToArticolo(result).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              this.snackbar.open(res.msg, 'Chiudi', {
                duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
              });
              this.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli, this.filtroConsegnati, this.filtroDaRiservare);
            },
            error: (e) => {
              console.error(e);
              this.snackbar.open('Errore! Non è stato possibile associare il fornitore all\'articolo', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
              this.loader = false;
            }
          });
      }
    });
  }

  updateArticoli(anno: any, serie: any, progressivo: any, data: any, filtro: boolean): void {
    this.loader = true;
    this.service.update(data).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getArticoliByOrdineId(anno, serie, progressivo, filtro, '', false);
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  annulla() {
    if(this.user === this.userLock) {
      this.service.annulla(this.anno, this.serie, this.progressivo).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any) => {
            if (data && !data.err) {
              this.route.navigate(['/ordini-clienti', this.status]);
            }
          }, error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    } else {
      this.route.navigate(['/ordini-clienti', this.status]);
    }
  }

  getArticoliByOrdineId(anno: any, serie: any, progressivo: any, filtro: boolean, filtroConsegnati: any, filtroDaRiservare: boolean): void {
    // this.filtroConsegnati = filtroConsegnati;
    this.totale = 0;
    this.loader = true;
    setTimeout(() => {
      let method = this.service.getArticoliByOrdineId(anno, serie, progressivo, filtro, false);
      if (this.soloVisualizza) {
        method = this.service.getArticoliByOrdineId(anno, serie, progressivo, filtro, this.soloVisualizza);
      }
      method.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: OrdineDettaglio) => {
            if (data && data.articoli) {
              data.articoli.forEach(d => {
                if (d.tipoRigo !== 'C' && d.prezzo && d.quantita) {
                  this.totale += (d.prezzo * d.quantita);
                }
              })
              this.articoli = data.articoli;
              this.sottoConto = data.sottoConto;
              this.intestazione = data.intestazione;
              this.userLock = data.userLock;
              this.locked = data.locked && this.user !== this.userLock;
              console.log("bloccato: " + this.locked);
            }

            this.createPaginator(this.articoli);
            if (filtroConsegnati) {
              this.filtraConsegnati();
            }
            if (filtroDaRiservare) {
              this.filtraDaRiservare();
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

  public filtraConsegnati() {
    if (this.filtroConsegnati === 'Da consegnare') {
      this.createPaginator(this.articoli!.filter((el: any) => {
        return !el.geFlagConsegnato || el.geFlagConsegnato === false;
      }))
    } else if (this.filtroConsegnati === 'Consegnato') {
      this.createPaginator(this.articoli!.filter((el: any) => {
        return el.geFlagConsegnato || el.geFlagConsegnato === true;
      }))
    } else {
      this.createPaginator(this.articoli);
    }
  }

  public filtraDaRiservare() {
    if (this.filtroDaRiservare) {
      this.createPaginator(this.articoli!.filter((el: any) => {
        return !el.geFlagRiservato || el.geFlagRiservato === false;
      }))
    } else {
      this.createPaginator(this.articoli);
    }
  }


}
