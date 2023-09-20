import {Component, Input, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../../services/ordine-cliente/articolo/articolo.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {HistoryDialogComponent} from "../../history-dialog/history-dialog.component";
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
import {SelectionModel} from '@angular/cdk/collections';
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {ListaBollaComponent} from "../logistica/lista-bolla/lista-bolla.component";
import {ListaComponent} from "../logistica/lista/lista.component";
import {AccontoDialogComponent} from "../logistica/acconto-dialog/acconto-dialog.component";
import {SchedeTecnicheComponent} from "../schede-tecniche/schede-tecniche.component";

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
  selection = new SelectionModel<any>(true, []);
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
  displayedColumns: string[] = ['select', 'codice', 'descrizione', 'quantita'];
  columnAcconti: string[] = ['dataFattura', 'numeroFattura', 'rifOrdCliente', 'operazione', 'prezzoAcconto', 'iva'];
  expandedElement: any;
  filtro: FiltroOrdini = new FiltroOrdini();
  accontiDaUsare: Acconto[] = [];

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
    if ((this.status === 'COMPLETO' || this.status === 'INCOMPLETO')) {
      this.filtroArticoli.flConsegna = 0;
      // @ts-ignore
      this.radioConsegnatoOptions[0].checked = true;
    }
    if ((this.status === 'DA_ORDINARE' || this.status === 'DA_PROCESSARE')) {
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
        width: '60%'
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  cercaAltriOrdini() {
    let list = this.selection.selected.filter(row => row.tipoRigo !=='C' && row.tipoRigo !=='AC' && row.flProntoConsegna);
    if(list.length == 0) {
      this.snackbar.open('Attenzione non è possibile procedere non è stato selezionato nessun articolo in pronta consegna!', 'Chiudi', {
        duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }
    this.loader = true;
    let  o = list[0];
    this.ordineService.cercaAltriOrdiniCliente(o.anno, o.serie, o.progressivo, this.ordineDettaglio.sottoConto).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && res.length > 0) {
            const dialogRef = this.dialog.open(ListaBollaComponent, {
              width: '90%',
              data: {ordini: res}
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.selection.select(...result);
              }
              this.cercaAcconti();
            });
          } else {
            this.cercaAcconti();
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

  cercaAcconti(){
    this.loader = true;
    this.service.cercaAcconti(this.ordineDettaglio.sottoConto, this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && res.length > 0) {
            const dialogRef = this.dialog.open(AccontoDialogComponent, {
              width: '90%',
              data: {acconti: res}
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.accontiDaUsare = result;
              }
              this.creaBolla();
            });
          } else {
            this.creaBolla();
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

  creaBolla() {
    this.loader = true;
    this.service.creaBolla(this.selection.selected, this.accontiDaUsare).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if(res && !res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
          } else {
            this.snackbar.open('Errore! Bolla non creata', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
            this.loader = false;
          }
        },
        error: () => {
          this.snackbar.open('Server non raggiungibile!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
        }
      })
  }

  creaOrdineForn() {
    this.loader = true;
    const list = this.selection.selected.filter(a => a.farticolo !== '*PZ' && a.farticolo !== '*MQ' && a.farticolo !== '*ML');
    this.ordineFornitoreService.creaOrdineFornitori(list).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && res instanceof Array) {
            const dialogRef = this.dialog.open(WarnDialogComponent, {
              width: '30%',
              data: {
                data: res,
                msg: "Ordine creato per i seguenti fornitori:"
              }
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
    if (this.user === this.ordineDettaglio.userLock) {
      this.service.annulla(this.filtroArticoli.anno, this.filtroArticoli.serie, this.filtroArticoli.progressivo).pipe(takeUntil(this.ngUnsubscribe))
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

  getArticoliByOrdineId(): void {
    this.loader = true;
    this.service.getArticoliByOrdineId(this.filtroArticoli).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: OrdineDettaglio) => {
          if (data && data.articoli) {
            this.ordineDettaglio = data;
            this.ordineDettaglio.locked = data.locked && this.user !== this.ordineDettaglio.userLock;
            console.log("bloccato: " + this.ordineDettaglio.locked);
          }
          this.createPaginator(this.ordineDettaglio.articoli, 100);
          this.selection = new SelectionModel<any>(true, []);
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

  checkRiservati() {
    if (this.isAmministrativo) {
      return false;
    }
    let found = false;
    for (const filterDatum of this.dataSource.filteredData) {
      // @ts-ignore
      if (filterDatum.tipoRigo !== 'C' && filterDatum.flagOrdinato && !filterDatum.flagRiservato) {
        found = true;
        break;
      }
    }
    return found;


  }

  checkQta(articolo: any) {
    articolo.qtaRiservata = articolo.quantita;
    if (!articolo.flagRiservato) {
      articolo.qtaRiservata = undefined;
    }
  }

  checkFlagRiservato(articolo: any) {
    articolo.flagRiservato = (articolo.qtaRiservata === articolo.quantita);
  }

  checkFlagProntoConsegna(articolo: any) {
    articolo.flProntoConsegna = (articolo.qtaProntoConsegna && articolo.qtaProntoConsegna !== 0);
  }

  checkQtaProntoConsegna(articolo: any) {
    if (articolo.flProntoConsegna) {
      if(articolo.qtaDaConsegnare) {
        articolo.qtaProntoConsegna = articolo.qtaDaConsegnare;
      } else {
        articolo.qtaProntoConsegna = articolo.quantita;
      }
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
                  articolo.note = result.note;
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
    if (this.showAcconti) {
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

  codificaArticoli() {
    const list = this.ordineDettaglio.articoli?.filter(a => (a.farticolo === '*PZ' || a.farticolo === '*MQ' || a.farticolo === '*ML'));
    this.loader = true;
    this.service.codificaArticoli(list).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && res instanceof Array) {
            const dialogRef = this.dialog.open(WarnDialogComponent, {
              width: '30%',
              data: {
                data: res,
                msg: "La codifica ha prodotti i seguenti errori:"
              }
            });
            dialogRef.afterClosed().subscribe(result => {

            });

          } else if (res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
          this.getArticoliByOrdineId();
        },
        error: () => {
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
        }
      })
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.tipoRigo !=='C' && data.tipoRigo !=='AC' &&
        (data.farticolo.toLowerCase().includes(filter)
        || data.fdescrArticolo.toLowerCase().includes(filter)
        || data.codArtFornitore.toLowerCase().includes(filter)
      ))
    }
  }

  cercaSchedeTecniche(): void {
    const list = this.selection.selected.filter(row => row.tipoRigo !=='C' && row.tipoRigo !=='AC');
    if(list.length == 0){
      return;
    }
    for (const l of list) {
      if(!l.codArtFornitore || l.codArtFornitore === ' ') {
        this.snackbar.open('Articolo senza codice fornitore: ' + l.farticolo, 'Chiudi', {
          duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
        })
        return;
      }
    }
    this.loader = true;
    this.service.cercaSchedeTecniche(list).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if(res){
            if(res.codArtFornList && res.codArtFornList.length > 0) {
              this.dialog.open(SchedeTecnicheComponent, {
                width: '80%',
                data: {
                  articoliList: res.codArtFornList
                }
              });
            } else {
              this.scaricaSchedeTecniche(res.searchDTOS);
            }
          }
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

  scaricaSchedeTecniche(list:any[]) {
    this.loader = true;
    this.service.scaricaSchedeTecniche(list).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.loader = false;
          if (data) {
            let a: any = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            let blob = new Blob([data], { type: 'application/zip' });
            let url= window.URL.createObjectURL(blob);
            a.href = url;
            a.download = "schede_tecniche.zip";
            a.click();
            window.URL.revokeObjectURL(url);
          } else {
            this.snackbar.open('Errore', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: (e:any) => {
          console.log(e);
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
        }
      })
  }
}
