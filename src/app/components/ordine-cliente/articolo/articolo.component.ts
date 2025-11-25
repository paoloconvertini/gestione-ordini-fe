import { Component, Input, OnInit } from '@angular/core';
import { CommonListComponent } from "../../commonListComponent";
import { MatDialog } from "@angular/material/dialog";
import { ArticoloService } from "../../../services/ordine-cliente/articolo/articolo.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../../environments/environment";
import { HistoryDialogComponent } from "../../history-dialog/history-dialog.component";
import { OrdineFornitoreService } from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import { FirmaDialogComponent } from "../../firma-dialog/firma-dialog.component";
import { OrdineClienteService } from "../../../services/ordine-cliente/list/ordine-cliente.service";
import { WarnDialogComponent } from "../../warn-dialog/warn-dialog.component";
import { AddFornitoreDialogComponent } from "../../add-fornitore-dialog/add-fornitore-dialog.component";
import { takeUntil } from "rxjs";
import { OrdineDettaglio } from "../../../models/ordine-dettaglio";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { Bolla } from "../../../models/Bolla";
import { FiltroArticoli } from "../../../models/FiltroArticoli";
import { OrdineClienteNotaDto } from "../../../models/OrdineClienteNotaDto";
import { OrdineClienteNoteDialogComponent } from "../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import { Acconto } from "../../../models/Acconto";
import { SelectionModel } from "@angular/cdk/collections";
import { FiltroOrdini } from "../../../models/FiltroOrdini";
import { ListaBollaComponent } from "../logistica/lista-bolla/lista-bolla.component";
import { AccontoDialogComponent } from "../logistica/acconto-dialog/acconto-dialog.component";
import { SchedeTecnicheComponent } from "../schede-tecniche/schede-tecniche.component";
import { CollegaOAFComponent } from "../../collega-oaf/collega-oaf.component";
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";
import { ArticoloClasseFornitoreComponent } from "../articolo-classe-fornitore/articolo-classe-fornitore.component";
import { SaldiMagazzinoService } from "../../../services/saldi-magazzino/saldi-magazzino.service";
import { CaricoMagazzinoDialogComponent } from "../../carico-magazzino-dialog/carico-magazzino-dialog.component";
import { FatturaAccontoDialogComponent } from "../../fattura-acconto-dialog/fattura-acconto-dialog.component";
import { AuthService } from "../../../services/auth/auth.service";


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
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
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
  status: any;
  ordineDettaglio: OrdineDettaglio = new OrdineDettaglio();
  selection = new SelectionModel<any>(true, []);
  bolle: Bolla[] = [];
  acconti: Acconto[] = [];
  radioOptions: Option[] = [{ name: "Da ordinare", checked: true }, { name: "Tutti", checked: false }];
  radioConsegnatoOptions: OptionCons[] = [
    { name: "Da consegnare", checked: false, value: 0 },
    { name: "Consegnato", checked: false, value: 1 },
    { name: "Pronto consegna", checked: false, value: 2 },
    { name: "Tutti", checked: false, value: 3 }
  ];
  displayedColumns: string[] = ['select', 'codice', 'descrizione', 'quantita'];
  columnAcconti: string[] = ['dataFattura', 'numeroFattura', 'rifOrdCliente', 'operazione', 'prezzoAcconto', 'iva'];
  expandedElement: any;
  filtro: FiltroOrdini = new FiltroOrdini();
  accontiDaUsare: Acconto[] = [];
  disabilitaBolla: boolean = false;


  constructor(
    private ordineService: OrdineClienteService,
    private ordineFornitoreService: OrdineFornitoreService,
    private service: ArticoloService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private route: Router,
    private router: ActivatedRoute,
    private saldiMagazzinoService: SaldiMagazzinoService,
    private auth: AuthService
  ) {
    super();

    this.displayedColumns = [
      ...this.displayedColumns,
      'qtaConsegnatoSenzaBolla',
      'prezzo',
      'prezzoTot',
      'tono',
      'qtaRiservata',
      'qtaProntoConsegna',
      'flRiservato',
      'flNonDisponibile',
      'flOrdinato',
      'flProntoConsegna',
      'flConsegnato',
      'azioni'
    ];
  }

  // ---------------------------------------------------------
  // GETTER PERMESSI
  // ---------------------------------------------------------

  get canEditDescrizione(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.descrizione');
  }

  get canEditQuantita(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.qta');
  }

  get canEditRiservato(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.riservato');
  }

  get canEditNonDisponibile(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.nonDisp');
  }

  get canEditOrdinato(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.ordinato');
  }

  get canEditOrdinatoLimitato(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.ordinato.limitato');
  }

  get canEditProntoConsegna(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.prontoCons');
  }

  get canEditConsegnato(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.consegnato');
  }

  get canEditQtaSenzaBolla(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.qtaSenzaBolla');
  }

  get canEditTono(): boolean {
    return this.auth.hasPerm('ordini.articoli.edit.tono');
  }

  get canViewHistory(): boolean {
    return this.auth.hasPerm('ordini.articoli.history');
  }

  get canAddNoteArticolo(): boolean {
    return this.auth.hasPerm('ordini.articoli.note');
  }

  get canAssocFornitori(): boolean {
    return this.auth.hasPerm('ordini.fornitori.associa');
  }

  get canViewOAF(): boolean {
    return this.auth.hasPerm('ordini.oaf.view');
  }

  get canCollegaOAF(): boolean {
    return this.auth.hasPerm('ordini.oaf.collega');
  }

  get canViewNoteOrdCli(): boolean {
    return this.auth.hasPerm('ordini.noteOrdCli.view');
  }

  get canVisualizzaNonDisponibile(): boolean {
    return this.auth.hasPerm('ordini.flags.nonDisponibile');
  }

  get canViewConsegne(): boolean {
    return this.auth.hasPerm('ordini.flags.consegne');
  }

  get canCreateBolla(): boolean {
    return this.auth.hasPerm('ordini.bolla.create');
  }

  get canCreateOrdiniFornitori(): boolean {
    return this.auth.hasPerm('ordini.fornitori.create');
  }

  get canCodificaArticoli(): boolean {
    return this.auth.hasPerm('ordini.articoli.codifica');
  }

  get canCreaFatturaAcconto(): boolean {
    return this.auth.hasPerm('ordini.fatturaAcconto.create');
  }

  get canAddNoteLogistica(): boolean {
    return this.auth.hasPerm('ordini.logistica.note');
  }

  get canViewSchedeTecniche(): boolean {
    return this.auth.hasPerm('ordini.articoli.schedeTecniche.view');
  }

  get canCaricoMagazzino(): boolean {
    return this.auth.hasPerm('ordini.magazzino.carico');
  }

  // PULSANTI FINALI
  get canSalvareOrdine(): boolean {
    return this.auth.hasPerm('ordini.edit');
  }

  get canChiudereOrdine(): boolean {
    return this.auth.hasPerm('ordini.chiudi');
  }

  get canFirmareOrdine(): boolean {
    return this.auth.hasPerm('ordini.firma');
  }

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------

  ngOnInit(): void {
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      this.filtroArticoli.anno = params.anno;
      this.filtroArticoli.serie = params.serie;
      this.filtroArticoli.progressivo = params.progressivo;
      this.status = params.status;
      this.filtro.page = params.page;
      this.filtro.size = params.size;
    });

    if (this.status === 'DA_ORDINARE' && this.canVisualizzaNonDisponibile) {
      this.filtroArticoli.flNonDisponibile = true;
    }

    if (this.status === 'COMPLETO' || this.status === 'INCOMPLETO') {
      this.filtroArticoli.flConsegna = 0;
      this.radioConsegnatoOptions[0].checked = true;
    }

    if (this.status === 'DA_ORDINARE' || this.status === 'DA_PROCESSARE') {
      this.filtroArticoli.flConsegna = 3;
      this.radioConsegnatoOptions[3].checked = true;
    }

    this.user = localStorage.getItem(environment.USERNAME);
    this.getArticoliByOrdineId();
  }

  // ---------------------------------------------------------
  // AZIONI STANDARD
  // ---------------------------------------------------------

  salvaOrdine() {
    this.updateArticoli();
  }

  getBolle(articolo: any) {
    if (this.expandedElement === articolo) {
      return;
    }
    this.loaderBolle = true;
    this.service.getBolle(articolo.progrGenerale)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.loaderBolle = false;
          this.bolle = data;
        },
        error: (e: any) => {
          this.loaderBolle = false;
          console.error(e);
        }
      });
  }

  showHistory(articolo: any) {
    this.dialog.open(HistoryDialogComponent, {
      width: '65%',
      data: articolo,
      autoFocus: false,
      maxHeight: '90vh'
    });
  }

  chiudiOrdine() {
    const dialogRef2 = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: { msg: "Sei sicuro di voler chiudere l'ordine? Questo potrebbe comportare il cambio di stato" },
    });

    dialogRef2.afterClosed().subscribe(result => {
      if (result) {
        this.service.chiudi(this.dataSource.filteredData)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              if (!res.error) {
                this.route.navigate(['/ordini-clienti', this.filtro.page, this.filtro.size]);
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
    const ordineId = `${this.filtroArticoli.anno}_${this.filtroArticoli.serie}_${this.filtroArticoli.progressivo}`;

    const dialogRef = this.dialog.open(FirmaDialogComponent, { width: '60%' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let data = new FormData();
        data.append('file', result);
        data.append('orderId', ordineId);
        this.loader = true;

        this.ordineService.upload(data)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Ordine firmato. Puoi trovare il pdf nella cartella condivisa', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                });
              }
              this.route.navigate(['/ordini-clienti', this.filtro.page, this.filtro.size]);
            },
            error: (e) => {
              this.loader = false;
              this.snackbar.open('Errore! Firma non creata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              });
            }
          });
      }
    });
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.dataSource.data);
    }
  }

  cercaAltriOrdini() {
    this.disabilitaBolla = true;
    this.loader = true;

    let list = this.selection.selected
      .filter(r => r.tipoRigo !== 'C' && r.tipoRigo !== 'AC' && r.flProntoConsegna && !r.flagConsegnato);

    if (list.length === 0) {
      this.snackbar.open('Attenzione: nessun articolo in pronta consegna selezionato!', 'Chiudi', {
        duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
      });
      return;
    }

    let o = list[0];

    this.ordineService.cercaAltriOrdiniCliente(o.anno, o.serie, o.progressivo, this.ordineDettaglio.sottoConto)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && res.length > 0) {
            const dialogRef = this.dialog.open(ListaBollaComponent, {
              width: '90%',
              data: { ordini: res }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (Array.isArray(result)) {
                this.selection.select(...result);
                this.cercaAcconti();
              } else if (result === true) {
                this.cercaAcconti();
              } else {
                this.disabilitaBolla = false;
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
      });
  }

  cercaAcconti() {
    this.loader = true;

    this.service.cercaAcconti(this.ordineDettaglio.sottoConto, this.selection.selected)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;

          if (res && res.length > 0) {
            const dialogRef = this.dialog.open(AccontoDialogComponent, {
              width: '90%',
              data: { acconti: res }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (Array.isArray(result)) {
                this.accontiDaUsare = result;
                this.creaBolla();
              } else if (result === true) {
                this.creaBolla();
              } else {
                this.disabilitaBolla = false;
              }
            });

          } else {
            this.creaBolla();
          }
        },
        error: () => {
          this.loader = false;
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.disabilitaBolla = false;
        }
      });
  }

  creaBolla() {
    this.loader = true;

    this.service.creaBolla(this.selection.selected, this.accontiDaUsare)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          this.accontiDaUsare = [];

          if (res && !res.error) {
            const ref = this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
            ref.afterDismissed().subscribe(() => this.disabilitaBolla = false);

          } else {
            this.snackbar.open('Errore! Bolla non creata', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
            this.disabilitaBolla = false;
          }
        },
        error: () => {
          this.loader = false;
          this.snackbar.open('Server non raggiungibile!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.disabilitaBolla = false;
        }
      });
  }

  creaOrdineForn() {
    this.loader = true;

    let error = false;

    this.selection.selected.forEach(a => {
      if (a.annoOAF) {
        this.snackbar.open(`ATTENZIONE: per l'articolo ${a.farticolo} esiste già un ordine a fornitore!!`, 'Chiudi', {
          duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
        });
        error = true;
        return;
      }
    });

    if (error) {
      this.loader = false;
      return;
    }

    const list = this.selection.selected.filter(a =>
      a.farticolo !== '*PZ' && a.farticolo !== '*MQ' && a.farticolo !== '*ML'
    );

    this.ordineFornitoreService.creaOrdineFornitori(list)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;

          if (Array.isArray(res)) {
            const dialogRef = this.dialog.open(WarnDialogComponent, {
              width: '30%',
              data: { data: res, msg: "Ordine creato per i seguenti fornitori:" }
            });
            dialogRef.afterClosed().subscribe(() => { });
            this.route.navigate(['/ordini-clienti', 'DA_ORDINARE', this.filtro.page, this.filtro.size]);

          } else if (res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: () => {
          this.loader = false;
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });
  }

  addFornitore(codice: any): void {
    const dialogRef = this.dialog.open(AddFornitoreDialogComponent, { width: '30%' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true;
        result.codiceArticolo = codice;

        this.service.addFornitoreToArticolo(result)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;
              this.snackbar.open(res.msg, 'Chiudi', {
                duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
              });
              this.getArticoliByOrdineId();
            },
            error: () => {
              this.loader = false;
              this.snackbar.open('Errore! Non è stato possibile associare il fornitore all\'articolo', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              });
            }
          });
      }
    });
  }

  updateArticoli(): void {
    this.loader = true;

    this.service.update(this.dataSource.filteredData)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getArticoliByOrdineId();
          }
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  annulla() {
    if (this.user === this.ordineDettaglio.userLock) {
      this.service.annulla(
        this.filtroArticoli.anno,
        this.filtroArticoli.serie,
        this.filtroArticoli.progressivo
      )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any) => {
            if (data && !data.err) {
              this.route.navigate(['/ordini-clienti', this.filtro.page, this.filtro.size]);
            }
          },
          error: () => {
            this.loader = false;
          }
        });

    } else {
      this.route.navigate(['/ordini-clienti', this.filtro.page, this.filtro.size]);
    }
  }

  getArticoliByOrdineId(): void {
    this.loader = true;

    this.service.getArticoliByOrdineId(this.filtroArticoli)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: OrdineDettaglio) => {

          if (data && data.articoli) {
            this.ordineDettaglio = data;
            this.ordineDettaglio.locked = data.locked && this.user !== this.ordineDettaglio.userLock;
          }

          this.createPaginator(this.ordineDettaglio.articoli, 100);
          this.selection = new SelectionModel<any>(true, []);

          if (this.filtro.searchText) {
            this.applyFilter();
          }

          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  checkRiservati() {
    if (this.canEditRiservato) return false;

    return this.dataSource.filteredData.some(
      (d: any) => d.tipoRigo !== 'C' && d.flagOrdinato && !d.flagRiservato
    );
  }

  checkQta(a: any) {
    if (a.flagRiservato) {
      a.qtaRiservata = a.qtaDaConsegnare ? a.qtaDaConsegnare : a.quantita;
    } else {
      a.qtaRiservata = undefined;
    }
  }

  checkFlagRiservato(a: any) {
    a.flagRiservato = (a.qtaRiservata === a.quantita);
  }

  checkFlagProntoConsegna(a: any) {
    a.flProntoConsegna = !!a.qtaProntoConsegna;
  }

  checkQtaProntoConsegna(a: any) {
    if (a.flProntoConsegna) {
      a.qtaProntoConsegna = a.qtaDaConsegnare ? a.qtaDaConsegnare : a.quantita;
    } else {
      a.qtaProntoConsegna = undefined;
    }
  }

  aggiungiNoteLogistica(ordine: OrdineDettaglio) {
    let data = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    data.note = ordine.noteLogistica;
    data.userNoteLogistica = ordine.userNoteLogistica;
    data.dataNoteLogistica = ordine.dataNoteLogistica;

    const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
      width: '50%',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true;
        this.ordineService.addNotes(result, 1)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;

              if (res && !res.error) {
                this.snackbar.open(res.msg, 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                });

                ordine.noteLogistica = result.note;
              }
            },
            error: () => {
              this.loader = false;
              this.snackbar.open('Errore! Nota non creata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              });
            }
          });
      }
    });
  }

  aggiungiNote(a: any) {
    let data = new OrdineClienteNotaDto();
    data.anno = a.anno;
    data.serie = a.serie;
    data.progressivo = a.progressivo;
    data.rigo = a.rigo;
    data.note = a.note;
    data.userNote = a.userNote;
    data.dataNote = a.dataNote;

    const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
      width: '50%',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true;

        this.service.addNotes(result)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              this.loader = false;

              if (res && !res.error) {
                this.snackbar.open(res.msg, 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                });

                a.note = result.note;
              }
            },
            error: () => {
              this.loader = false;
              this.snackbar.open('Errore! Mail non inviata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              });
            }
          });
      }
    });
  }

  mostraAcconti() {
    this.showAcconti = !this.showAcconti;
  }

  codificaArticoli() {
    const list = this.ordineDettaglio.articoli?.filter(a =>
      a.farticolo === '*PZ' || a.farticolo === '*MQ' || a.farticolo === '*ML'
    );

    this.loader = true;

    this.service.codificaArticoli(list)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {

          this.loader = false;

          if (res && res.errors?.length > 0) {
            const dialogRef = this.dialog.open(WarnDialogComponent, {
              width: '30%',
              data: { data: res.errors, msg: "La codifica ha prodotto i seguenti errori:" }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result && res.showTCA) {
                this.dialog.open(ArticoloClasseFornitoreComponent, {
                  width: '85%'
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
          this.loader = false;
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);

    this.dataSource.filterPredicate = (d: any, filter: string): boolean => {
      return (
        d.tipoRigo !== 'C' &&
        d.tipoRigo !== 'AC' &&
        (
          d.farticolo.toLowerCase().includes(filter) ||
          d.fdescrArticolo.toLowerCase().includes(filter) ||
          d.codArtFornitore.toLowerCase().includes(filter)
        )
      );
    };
  }

  cercaSchedeTecniche() {
    const list = this.selection.selected
      .filter(r => r.tipoRigo !== 'C' && r.tipoRigo !== 'AC');

    if (list.length === 0) return;

    for (const l of list) {
      if (!l.codArtFornitore || l.codArtFornitore.trim() === '') {
        this.snackbar.open(`Articolo senza codice fornitore: ${l.farticolo}`, 'Chiudi', {
          duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
        });
        return;
      }
    }

    this.loader = true;

    this.service.cercaSchedeTecniche(list)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;

          if (res) {
            if (res.codArtFornList && res.codArtFornList.length > 0) {
              this.dialog.open(SchedeTecnicheComponent, {
                width: '80%',
                data: { articoliList: res.codArtFornList }
              });

            } else {
              this.scaricaSchedeTecniche(res.searchDTOS);
            }
          }
        },
        error: () => {
          this.loader = false;
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });
  }

  scaricaSchedeTecniche(list: any[]) {
    this.loader = true;

    this.service.scaricaSchedeTecniche(list)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.loader = false;

          if (data) {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";

            let blob = new Blob([data], { type: 'application/zip' });
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
        error: () => {
          this.loader = false;
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      });
  }

  collegaOAF(a: any) {
    this.route.navigate([
      '/collega-oaf',
      a.progrGenerale,
      this.filtro.page,
      this.filtro.size,
      a.anno,
      a.serie,
      a.progressivo,
      this.status
    ]);
  }

  resetQta(a: any) {
    a.flagRiservato = false;
    a.flProntoConsegna = false;
    a.qtaRiservata = undefined;
    a.qtaProntoConsegna = undefined;
  }

  caricaMagazzino() {
    const list = this.selection.selected.filter(a =>
      a.farticolo !== '*PZ' && a.farticolo !== '*MQ' && a.farticolo !== '*ML'
    );

    const dialogRef = this.dialog.open(CaricoMagazzinoDialogComponent, { width: '70%' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loader = true;
        result.articoli = list;

        this.saldiMagazzinoService.caricaMagazzino(result)
          .pipe(takeUntil(this.ngUnsubscribe))
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
              }
            },
            error: () => {
              this.loader = false;
            }
          });
      }
    });
  }

  creaFatturaAcconto() {
    this.ordineService.getOrdineFatturaAcconto(
      this.ordineDettaglio.sottoConto,
      this.selection.selected
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;

          if (res) {
            const dialogRef = this.dialog.open(FatturaAccontoDialogComponent, {
              hasBackdrop: false,
              width: '90%',
              maxHeight: '90vh',
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

                this.ordineService.creaFattureAcconto(result)
                  .pipe(takeUntil(this.ngUnsubscribe))
                  .subscribe({
                    next: (res2) => {
                      this.loader = false;

                      if (res2 && !res2.error) {
                        this.snackbar.open(res2.msg, 'Chiudi', {
                          horizontalPosition: 'center',
                          verticalPosition: 'top'
                        });
                      }
                    },
                    error: () => {
                      this.loader = false;
                      this.snackbar.open('Server non raggiungibile!', 'Chiudi', {
                        duration: 5000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top'
                      });
                    }
                  });
              }
            });
          }
        }
      });
  }
}

export interface AccontoLight {
  anno: number;
  serie: string;
  progressivo: number;
}
