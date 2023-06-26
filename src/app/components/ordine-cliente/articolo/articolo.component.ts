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
import {FiltroArticoli} from "../../../models/FiltroArticoli";
import {OrdineClienteNotaDto} from "../../../models/OrdineClienteNotaDto";
import {OrdineClienteNoteDialogComponent} from "../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {Acconto} from "../../../models/Acconto";

export interface Option {
  name: string,
  checked: boolean | null
}
export interface OptionCons {
  name: string,
  checked: boolean,
  value: number
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
  user: any;
  loaderAcconti: boolean = false;
  loaderBolle: boolean = false;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  showAcconti: boolean = false;
  filtroArticoli: FiltroArticoli = new FiltroArticoli();
  status: any;
  ordineDettaglio: OrdineDettaglio = new OrdineDettaglio();
  bolle: Bolla[] = [];
  acconti: Acconto[] = [];
  radioOptions: Option[] = [{name: "Da ordinare", checked: true}, {name: "Tutti", checked: false}];
  radioConsegnatoOptions: OptionCons[] = [
    {name: "Da consegnare", checked: false, value: 0},
    {name: "Consegnato", checked: false, value: 1},
    {name: "Pronto consegna", checked: false, value: 2},
    {name: "Tutti", checked: false, value: 3}
  ];
  //radioDaRiservareOptions: Option[] = [{name: "Da riservare", checked: false}, {name: "Tutti", checked: true}];
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita'];
  columnAcconti: string[] = ['dataFattura', 'numeroFattura', 'rifOrdCliente', 'operazione', 'prezzo'];
  expandedElement: any;


  ngOnInit(): void {
    this.filtroArticoli.view = this.route.url.includes('view');
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      this.filtroArticoli.anno = params.anno;
      this.filtroArticoli.serie = params.serie;
      this.filtroArticoli.progressivo = params.progressivo;
      this.status = params.status;
    });
    if (this.isAmministrativo && this.status === 'DA_ORDINARE') {
      this.filtroArticoli.flNonDisponibile = true;
    }
    /* this.subscription = timer(0, 5000).pipe(
       switchMap( () =>
         this.service.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli)))
       .subscribe(result => console.log(result)
     )*/
    if ((this.status === 'COMPLETO' || this.status === 'INCOMPLETO') && !this.isLogistica) {
      this.filtroArticoli.flConsegna = 0;
      // @ts-ignore
      this.radioConsegnatoOptions[0].checked = true;
    }
    if (this.isLogistica) {
      this.filtroArticoli.flConsegna = 2;
      // @ts-ignore
      this.radioConsegnatoOptions[2].checked = true;
    }
    if((this.status === 'DA_ORDINARE' || this.status === 'DA_PROCESSARE') && !this.isLogistica) {
      this.filtroArticoli.flConsegna = 3;
      // @ts-ignore
      this.radioConsegnatoOptions[3].checked = true;
    }
    this.user = localStorage.getItem(environment.USERNAME);
    this.getArticoliByOrdineId();
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
    if (localStorage.getItem(environment.LOGISTICA)) {
      this.isLogistica = true;
    }
    this.displayedColumns = [...this.displayedColumns, 'prezzo', 'prezzoTot', 'tono', 'qtaRiservata', 'qtaProntoConsegna',
      'flRiservato', 'flDisponibile', 'flOrdinato', 'flProntoConsegna', 'flConsegnato', 'azioni']
  }

  /*ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }*/

  salvaOrdine() {
    this.updateArticoli();
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
      if (articolo.flagNonDisponibile) {
        articolo.flagNonDisponibile = false;
      }
    } else if (from === 2) {
      if (articolo.flagRiservato) {
        articolo.flagRiservato = false;
      }
    }
  }

  apriFirma() {
    let ordineId = this.filtroArticoli.anno + '_' +
      this.filtroArticoli.serie + '_' + this.filtroArticoli.progressivo;
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
    this.ordineFornitoreService.creaOrdineFornitori(this.filtroArticoli.anno, this.filtroArticoli.serie, this.filtroArticoli.progressivo).pipe(takeUntil(this.ngUnsubscribe))
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
              this.getArticoliByOrdineId();
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

  updateArticoli(): void {
    this.loader = true;
    this.service.update(this.dataSource.filteredData).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getArticoliByOrdineId();
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  annulla() {
    if(this.user === this.ordineDettaglio.userLock) {
      this.service.annulla(this.filtroArticoli.anno, this.filtroArticoli.serie, this.filtroArticoli.progressivo).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any) => {
            if (data && !data.err) {
              this.route.navigate(['/ordini-clienti']);
            }
          }, error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    } else {
      this.route.navigate(['/ordini-clienti']);
    }
  }

  getArticoliByOrdineId(): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getArticoliByOrdineId(this.filtroArticoli).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: OrdineDettaglio) => {
            if (data && data.articoli) {
              this.ordineDettaglio = data;
              this.ordineDettaglio.locked = data.locked && this.user !== this.ordineDettaglio.userLock;
              console.log("bloccato: " + this.ordineDettaglio.locked);
            }
            this.createPaginator(this.ordineDettaglio.articoli);
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

  checkRiservati() {
    if(this.isAmministrativo){
      return false;
    }
    let found = false;
    for (const filterDatum of this.dataSource.filteredData) {
      // @ts-ignore
      if(filterDatum.tipoRigo !== 'C' && filterDatum.flagOrdinato && !filterDatum.flagRiservato) {
        found = true;
        break;
      }
    }
    return found;


  }

  checkQta(articolo:any) {
    articolo.qtaRiservata = articolo.quantita;
    if(!articolo.flagRiservato) {
      articolo.qtaRiservata = undefined;
    }
  }

  checkFlagRiservato(articolo:any) {
      articolo.flagRiservato = (articolo.qtaRiservata === articolo.quantita);
  }

  checkFlagProntoConsegna(articolo:any) {
    articolo.flProntoConsegna = (articolo.qtaProntoConsegna && articolo.qtaProntoConsegna !== 0);
  }

  checkQtaProntoConsegna(articolo:any) {
    if(articolo.flProntoConsegna) {
      articolo.qtaProntoConsegna = articolo.quantita;
    } else {
      articolo.qtaProntoConsegna = undefined;
    }
  }

  aggiungiNote(articolo: any) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = articolo.anno;
    data.serie = articolo.serie;
    data.progressivo = articolo.progressivo;
    data.rigo = articolo.rigo;
    data.note = articolo.note;
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
                  this.getArticoliByOrdineId();
                }
              },
              error: (e) => {
                console.error(e);
                this.snackbar.open('Errore! Mail non inviata', 'Chiudi', {
                  duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
                })
                this.loader = false;
              }
            });
        }
      });
    }
  }

  mostraAcconti(sottoConto: string) {
    this.showAcconti = !this.showAcconti;
    if(this.showAcconti){
      this.loaderAcconti = true;
      this.service.getAcconti(sottoConto).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: Acconto[]) => {
            if (data) {
              this.acconti = data;
            }
            this.loaderAcconti = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loaderAcconti = false;
          }
        })
    }

  }
}
