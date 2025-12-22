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
import {ListaBollaComponent} from "../logistica/lista-bolla-dialog/lista-bolla.component";
import {AccontoDialogComponent} from "../logistica/acconto-dialog/acconto-dialog.component";
import {SchedeTecnicheComponent} from "../schede-tecniche/schede-tecniche.component";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {ArticoloClasseFornitoreComponent} from "../articolo-classe-fornitore/articolo-classe-fornitore.component";
import {SaldiMagazzinoService} from "../../../services/saldi-magazzino/saldi-magazzino.service";
import {CaricoMagazzinoDialogComponent} from "../../carico-magazzino-dialog/carico-magazzino-dialog.component";
import { FatturaAccontoDialogComponent } from '../../fattura-acconto-dialog/fattura-acconto-dialog.component';
import {PermissionService} from "../../../services/auth/permission.service";
import {OrdiniClientiStateService} from "../../../services/state/ordini-clienti-state.service";
import {AuthService} from "../../../services/auth/auth.service";

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
export class ArticoloComponent extends CommonListComponent implements OnInit {

  @Input()
  user: any;
  loaderAcconti: boolean = false;
  loaderBolle: boolean = false;
  showAcconti: boolean = false;
  filtroArticoli: FiltroArticoli = new FiltroArticoli();
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
  disabilitaBolla: boolean = false;


  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => {

        this.filtroArticoli.anno = params.anno;
        this.filtroArticoli.serie = params.serie;
        this.filtroArticoli.progressivo = params.progressivo;
      });

    this.filtro = this.state.getState();
    this.user = this.authService.getCurrentUser()?.username;

    if (this.perm.canDefaultFiltroNonDisponibile && this.filtro.statusOrdine === 'DA_ORDINARE') {
      this.filtroArticoli.flNonDisponibile = true;
    }
    if ((this.filtro.statusOrdine === 'COMPLETO' || this.filtro.statusOrdine === 'INCOMPLETO')) {
      this.filtroArticoli.flConsegna = 0;
      // @ts-ignore
      this.radioConsegnatoOptions[0].checked = true;
    }
    if ((this.filtro.statusOrdine === 'DA_PROCESSARE')) {
      this.filtroArticoli.flConsegna = 3;
      // @ts-ignore
      this.radioConsegnatoOptions[3].checked = true;
    }
    this.getArticoliByOrdineId();
  }

  constructor(private ordineService: OrdineClienteService, private ordineFornitoreService: OrdineFornitoreService,
              private service: ArticoloService, private dialog: MatDialog, private authService: AuthService,
              private snackbar: MatSnackBar, private router: Router, private route: ActivatedRoute,
              public perm: PermissionService, private state: OrdiniClientiStateService,
              private saldiMagazzinoService: SaldiMagazzinoService) {
    super();
    if (this.perm.canEditQtaConsegnatoSenzaBolla) {   // nuovo permesso
      this.displayedColumns = [...this.displayedColumns, 'qtaConsegnatoSenzaBolla'];
    }
    this.displayedColumns = [...this.displayedColumns, 'prezzo', 'prezzoTot', 'tono', 'qtaRiservata', 'qtaProntoConsegna',
      'flRiservato', 'flDisponibile', 'flOrdinato', 'flProntoConsegna', 'flConsegnato', 'azioni']
  }

  salvaOrdine() {
    this.updateArticoli();
  }

  getBolle(articolo: any) {
    if (this.expandedElement === articolo) {
      return;
    }
    this.loaderBolle = true;
    this.service.getBolle(articolo.progrGenerale).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
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
    let msg = "Sei sicuro di voler chiudere l'ordine? Questo potrebbe comportare il cambio di stato";
    const dialogRef2 = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });
    dialogRef2.afterClosed().subscribe(result => {
      if (result) {
        this.service.chiudi(this.dataSource.filteredData).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (res) => {
            if (!res.error) {
              let url = '/ordini-clienti';
              this.router.navigate([url]);
            }
          }
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
              this.router.navigate(['/ordini-clienti']);
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
    this.disabilitaBolla = true;
    this.loader = true;
    let list = this.selection.selected.filter(row => row.tipoRigo !== 'C' && row.tipoRigo !== 'AC' && row.flProntoConsegna && !row.flagConsegnato);
    if (list.length == 0) {
      this.snackbar.open('Attenzione non è possibile procedere non è stato selezionato nessun articolo in pronta consegna che non sia già stato consegnato!', 'Chiudi', {
        duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }
    let o = list[0];
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
              if (result && result instanceof Array) {
                this.selection.select(...result);
                this.cercaAcconti();
              } else if(result === true) {
                this.cercaAcconti();
              } else {
                this.disabilitaBolla = false;
                return;
              }

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
          this.disabilitaBolla = false;
        }
      })

  }

  cercaAcconti() {
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
              if (result && result instanceof Array) {
                this.accontiDaUsare = result;
                this.creaBolla();
              } else if(result === true) {
                this.creaBolla();
              } else {
                this.disabilitaBolla = false;
                return;
              }
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
          this.disabilitaBolla = false;
        }
      })
  }

  creaBolla() {
    this.loader = true;
    this.service.creaBolla(this.selection.selected, this.accontiDaUsare).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          this.accontiDaUsare = [];
          if (res && !res.error) {
            let snackBarRef = this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
            snackBarRef.afterDismissed().subscribe(() => {
              this.disabilitaBolla = false;
            });
          } else {
            this.snackbar.open('Errore! Bolla non creata', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
            this.loader = false;
            this.disabilitaBolla = false;
          }
        },
        error: () => {
          this.snackbar.open('Server non raggiungibile!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
          this.disabilitaBolla = false;
        }
      })
  }

  creaOrdineForn() {
    this.loader = true;
    let error = false;
    this.selection.selected.forEach(a => {
      if(a.annoOAF){
        this.snackbar.open("ATTENZIONE, per l'articolo " + a.farticolo + " esiste già un ordine a fornitore!!", 'Chiudi', {
          duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
        });
        error = true;
        return;
      }
    })
    if(error){
      this.loader = false;
      return;
    }
    const list = this.selection.selected.filter(a => a.farticolo !== '*PZ' &&
      a.farticolo !== '*MQ' && a.farticolo !== '*ML');
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
            this.router.navigate(['/ordini-clienti']);
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
              this.router.navigate(['/ordini-clienti']);
            }
          }, error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    } else {
      this.router.navigate(['/ordini-clienti']);
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
          if (this.filtro.searchText) {
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

  checkQta(articolo: any) {
    if (articolo.flagRiservato) {
      if (articolo.qtaDaConsegnare) {
        articolo.qtaRiservata = articolo.qtaDaConsegnare;
      } else {
        articolo.qtaRiservata = articolo.quantita;
      }
    } else {
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
      if (articolo.qtaDaConsegnare) {
        articolo.qtaProntoConsegna = articolo.qtaDaConsegnare;
      } else {
        articolo.qtaProntoConsegna = articolo.quantita;
      }
    } else {
      articolo.qtaProntoConsegna = undefined;
    }
  }

  aggiungiNoteLogistica(ordine: OrdineDettaglio) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    data.note = ordine.noteLogistica;
    data.userNoteLogistica = ordine.userNoteLogistica;
    data.dataNoteLogistica = ordine.dataNoteLogistica;
    {
      const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
        width: '50%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loader = true;
          this.ordineService.addNotes(result, 1).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                  ordine.noteLogistica = result.note;
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

  aggiungiNote(articolo: any) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = articolo.anno;
    data.serie = articolo.serie;
    data.progressivo = articolo.progressivo;
    data.rigo = articolo.rigo;
    data.note = articolo.note;
    data.userNote = articolo.userNote;
    data.dataNote = articolo.dataNote;
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
  }

  codificaArticoli() {
    const list = this.ordineDettaglio.articoli?.filter((a:any) => (a.farticolo === '*PZ' || a.farticolo === '*MQ' || a.farticolo === '*ML'));
    this.loader = true;
    this.service.codificaArticoli(list).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          let response = res;
          if (response && response.errors && response.errors.length > 0) {
            const dialogRef = this.dialog.open(WarnDialogComponent, {
              width: '30%',
              data: {
                data: response.errors,
                msg: "La codifica ha prodotti i seguenti errori:"
              }
            });
            dialogRef.afterClosed().subscribe(result => {
              if(result && res.showTCA) {
                const dialogRef2 = this.dialog.open(ArticoloClasseFornitoreComponent, {
                  width: '85%'
                });
                dialogRef2.afterClosed().subscribe(res => {

                });
              }
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
        data.tipoRigo !== 'C' && data.tipoRigo !== 'AC' &&
        (data.farticolo.toLowerCase().includes(filter)
          || data.fdescrArticolo.toLowerCase().includes(filter)
          || data.codArtFornitore.toLowerCase().includes(filter)
        ))
    }
  }

  cercaSchedeTecniche(): void {
    const list = this.selection.selected.filter(row => row.tipoRigo !== 'C' && row.tipoRigo !== 'AC');
    if (list.length == 0) {
      return;
    }
    for (const l of list) {
      if (!l.codArtFornitore || l.codArtFornitore === ' ') {
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
          if (res) {
            if (res.codArtFornList && res.codArtFornList.length > 0) {
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

  scaricaSchedeTecniche(list: any[]) {
    this.loader = true;
    this.service.scaricaSchedeTecniche(list).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.loader = false;
          if (data) {
            let a: any = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            let blob = new Blob([data], {type: 'application/zip'});
            let url = window.URL.createObjectURL(blob);
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
        error: (e: any) => {
          console.log(e);
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
        }
      })
  }

  collegaOAF(articolo: any) {
    this.router.navigate(['/collega-oaf', articolo.progrGenerale, articolo.anno, articolo.serie, articolo.progressivo]);
  }

  resetQta(articolo: any) {
    articolo.flagRiservato = false;
    articolo.flProntoConsegna = false;
    articolo.qtaRiservata = undefined;
    articolo.qtaProntoConsegna = undefined;
  }

  caricaMagazzino() {
    const list = this.selection.selected.filter(a => a.farticolo !== '*PZ' &&
      a.farticolo !== '*MQ' && a.farticolo !== '*ML');
    const dialogRef = this.dialog.open(CaricoMagazzinoDialogComponent, {
      width: '70%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.loader = true;
        result.articoli = list;
        this.saldiMagazzinoService.caricaMagazzino(result).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open(res.msg, 'Chiudi', {
                  horizontalPosition: 'center', verticalPosition: 'top'
                });
              } else {
                this.snackbar.open('Errore! Carico di magazzino non creato', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                });
                this.loader = false;
              }
            }, error: ()=> {
              this.loader = false;
        }
          })
      }
    });

  }

  creaFatturaAcconto() {
    this.ordineService.getOrdineFatturaAcconto(this.ordineDettaglio.sottoConto, this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res) {
            const dialogRef = this.dialog.open(FatturaAccontoDialogComponent, {
              hasBackdrop: false,
              width: '90%',
              maxHeight: '90vh',  // limita l’altezza totale
              panelClass: 'pannello-acconti',
              data: {
                ordini: res,
                intestazione: this.ordineDettaglio.intestazione,
                sottoConto: this.ordineDettaglio.sottoConto
              }
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.loader = true;
                this.ordineService.creaFattureAcconto(result).pipe(takeUntil(this.ngUnsubscribe))
                  .subscribe({
                    next: (res) => {
                        this.loader = false;
                        if (res && !res.error) {
                          this.snackbar.open(res.msg, 'Chiudi', {
                            horizontalPosition: 'center', verticalPosition: 'top'
                          });
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
            });
          }
        }
      })
  }
}

export interface AccontoLight {
  anno: number;
  serie: string;
  progressivo: number;
}
