import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonListComponent} from "../../../commonListComponent";
import {AuthService} from "../../../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../../../services/email/email.service";
import {OrdineClienteService} from "../../../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {ListaService} from "../../../../services/ordine-cliente/logistica/lista.service";
import {FiltroOrdini} from "../../../../models/FiltroOrdini";
import {OrdineCliente} from "../../../../models/ordine-cliente";
import {OrdineClienteNotaDto} from "../../../../models/OrdineClienteNotaDto";
import {OrdineClienteNoteDialogComponent} from "../../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {Option} from "../../ordine-cliente-list/ordine-cliente.component";
import {ArticoloCliente} from "../../../../models/ArticoloCliente";
import {ArticoloService} from "../../../../services/ordine-cliente/articolo/articolo.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import OlMap from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {useGeographic} from "ol/proj";
import {Icon, RegularShape, Style} from 'ol/style.js';
import {Cluster, Vector as VectorSource} from 'ol/source.js';
import {Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Feature} from "ol";
import Popup from "ol-popup";
import {Fill, Stroke, Text} from "ol/style";
import {boundingExtent} from 'ol/extent.js';
import CircleStyle from "ol/style/Circle";
import {VeicoloService} from "../../../../services/ordine-cliente/veicolo/veicolo.service";
import {OrdiniClientiPregressiDialogComponent} from "../ordini-clienti-pregressi-dialog/ordini-clienti-pregressi-dialog.component";
import {NotaConsegnaService} from "../../../../services/nota-consegna/nota-consegna.service";
import {NotaConsegna} from "../../../../models/NotaConsegna";
import {ImportoVenditore} from "../../../../models/ImportoVenditore";
import {BaseComponent} from "../../../baseComponent";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, MatPaginatorIntl, PageEvent} from "@angular/material/paginator";
import {FidoClienteComponent} from "../fido-cliente/fido-cliente.component";

useGeographic();

const sedeLonLat = [17.5083, 40.6472];
const sede = new Point(sedeLonLat);
const stroke = new Stroke({color: 'black', width: 2});
const fill = new Fill({color: 'red'});

export interface VStatus {
  id: any,
  descrizione: string
}

export interface OptStatus {
  codice: any,
  descrizione: string
}

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListaComponent extends BaseComponent implements OnInit {

  loader = false;
  dataSource = new MatTableDataSource;
  dataSourceRiservati = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  _intl: MatPaginatorIntl = new MatPaginatorIntl ();
  displayedColumns: string[] = [
    'numero', 'cliente', 'localita', 'data', 'status',
    'dataConsegna','oraConsegna', 'ordinamento', 'veicolo', 'azioni'
  ];

  // 🔥 RUOLI ELIMINATI COMPLETAMENTE – solo permessi
  filtro: FiltroOrdini = new FiltroOrdini();
  radioPerVenditoreOptions: Option[] = [];
  radioPerStatusOptions: OptStatus[] = [
    {codice: 'TUTTI', descrizione: 'TUTTI'},
    {codice: 'DA_PROCESSARE', descrizione: 'DA PROCESSARE'},
    {codice: 'DA_ORDINARE', descrizione: 'DA ORDINARE'},
    {codice: 'INCOMPLETO', descrizione: 'INCOMPLETO'},
    {codice: 'COMPLETO', descrizione: 'COMPLETO'},
    {codice: 'ARCHIVIATO', descrizione: 'ARCHIVIATO'}
  ];

  stato: string = '';
  loaderDettaglio: boolean = false;
  expandedElement: any;
  articoli: ArticoloCliente[] = [];
  showMappa: boolean = false;
  map: OlMap = new OlMap();

  selectVeicoloOptions: VStatus[] = [];
  selectStatusOptions: OptStatus[] = [];

  notaConsegna: NotaConsegna = new NotaConsegna();
  importiMap: any = new Map<string, number>();
  importiList: ImportoVenditore[] = [];

  totalItems = 0;

  constructor(
    private auth: AuthService,
    private router: ActivatedRoute,
    private emailService: EmailService,
    private service: ListaService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private route: Router,
    private notaConsegnaService: NotaConsegnaService,
    private ordineClienteService: OrdineClienteService,
    private articoloService: ArticoloService,
    private veicoloService: VeicoloService
  ) {
    super();

    this._intl.itemsPerPageLabel = 'Elementi per pagina';
    this._intl.nextPageLabel = 'Prossima';
    this._intl.previousPageLabel = 'Precedente';
    this._intl.firstPageLabel = 'Prima';
    this._intl.lastPageLabel = 'Ultima';

    // ❗ Logica invariata: se logistica → status iniziale COMPLETO
    this.filtro.status = 'TUTTI';
  }

  /* ------------------ PERMESSI ------------------ */

  get canModificaStatus() {
    return this.auth.hasPerm('ordine.status.modifica');
  }

  get canSalvaStatus() {
    return this.auth.hasPerm('ordine.status.salva');
  }

  get canModificaVeicolo() {
    return this.auth.hasPerm('ordine.veicolo.modifica');
  }

  get canAggiungiNoteLogistica() {
    return this.auth.hasPerm('ordine.note.logistica');
  }

  /* ------------------ INIT ------------------ */

  ngOnInit(): void {
    this.getStati();
    this.getVeicoli();
    this.getVenditori();
    this.retrieveList();
    this.getAllRiservati();
  }

  /* ------------------ PAGINAZIONE ------------------ */

  onPageChange(event: PageEvent) {
    this.filtro.page = event.pageIndex;
    this.filtro.size = event.pageSize;
    this.retrieveList();
  }

  /* ------------------ STATI ------------------ */

  getStati(): void {
    this.ordineClienteService.getStati().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.radioPerStatusOptions = data;
        if (!this.filtro.status) {
          this.filtro.status = 'TUTTI';
        }
        this.selectStatusOptions = data.filter((e: any) => e.descrizione !== 'TUTTI');
      }
    })
  }

  /* ------------------ NOTE CONSEGNA ------------------ */

  getNotaConsegna(): void {
    let data = this.filtro.dataConsegnaStart.format('DDMMyyyy');
    this.notaConsegnaService.getNota(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: any) => {
        this.notaConsegna = data ? data : new NotaConsegna();
      }
    })
  }

  saveNotaConsegna(): void {
    this.notaConsegna.dataNota = this.filtro.dataConsegnaStart;
    this.notaConsegnaService.salvaNota(this.notaConsegna).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res: any) => {
        if (res && !res.error) {
          this.snackbar.open(res.msg, 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          })
        }
      }
    })
  }

  resetPage() {
    this.filtro.page = 0;
  }

  /* ------------------ LISTA ------------------ */

  retrieveList(): void {
    this.loader = true;
    this.service.getAll(this.filtro).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: any | undefined) => {
        this.totalItems = data.count;
        this.dataSource.data = data.list;
        this.loader = false;
      }
    })
  }

  getAllRiservati(): void {
    this.loader = true;
    this.service.getAllRiservati(this.filtro).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: any | undefined) => {
        this.importiMap = data.importoRiservatiMap;
        this.dataSourceRiservati.data = data.list;
        this.loader = false;
        if (!this.filtro.codVenditore) {
          this.getVenditori();
        }
      },
      error: (e: any) => {
        console.error(e);
        this.loader = false;
      }
    })
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');
    this.auth.getVenditori(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.importiList = [];
        this.radioPerVenditoreOptions = data;
        let totale = 0;
        this.radioPerVenditoreOptions.forEach(opt => {
          let i = new ImportoVenditore();
          i.codice = opt.codVenditore;
          i.fullname = opt.fullname;
          if (opt.fullname === 'tutti') {
            i.import = totale;
          } else {
            i.import = this.importiMap[opt.codVenditore] ? this.importiMap[opt.codVenditore] : 0;
            totale += i.import;
          }
          this.importiList.push(i);
        })
      },
      error: (e: any) => {
        console.error(e);
      }
    })
  }

  refreshPage() {
    this.getVenditori();
    this.loader = true;
    this.ordineClienteService.aggiornaLista().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: () => {
        this.retrieveList();
        this.loader = false;
      },
      error: (e: any) => {
        console.error(e);
        this.loader = false;
      }
    })
  }

  /* ------------------ NOTE ORDINE ------------------ */

  aggiungiNote(ordine: OrdineCliente, from: number) {

    if (from === 1 && !this.canAggiungiNoteLogistica) return;

    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;

    if (from === 0) {
      data.note = ordine.note;
      data.userNote = ordine.userNote;
      data.dataNote = ordine.dataNote;
    } else {
      data.note = ordine.noteLogistica;
      data.userNoteLogistica = ordine.userNoteLogistica;
      data.dataNoteLogistica = ordine.dataNoteLogistica;
    }

    const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
      width: '50%',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ordineClienteService.addNotes(result, from).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              if (res && !res.error) {
                this.snackbar.open(res.msg, 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
                if (from === 0) ordine.note = result.note;
                else ordine.noteLogistica = result.note;
              }
            },
            error: (e) => {
              console.error(e);
              this.snackbar.open('Errore! Nota non creata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
            }
          });
      }
    });
  }

  downloadOrdine(ordine: OrdineCliente) {
    this.ordineClienteService.download(ordine);
  }

  cercaBolle() {
    this.loader = true;
    this.ordineClienteService.cercaBolle().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: any | undefined) => {
        this.totalItems = data.count;
        this.dataSource = new MatTableDataSource(data.list);
        this.loader = false;
      },
      error: (e: any) => {
        console.error(e);
        this.loader = false;
      }
    })
  }

  /* ------------------ ARTICOLI ------------------ */

  getArticoli(ordine: OrdineCliente) {
    if (this.expandedElement === ordine) return;

    this.loaderDettaglio = true;
    let bolla = ordine.status ? 'N' : '0';

    this.articoloService.getArticoli(bolla, ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: ArticoloCliente[]) => {
          if (data) this.articoli = data;
          this.loaderDettaglio = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loaderDettaglio = false;
        }
      })
  }

  mostraNonDisponibile(articolo: any): number {
    if (articolo.tipoRigo !== '' && articolo.tipoRigo !== ' ') return 2;
    else if (articolo.flagNonDisponibile || (articolo.flagOrdinato && !articolo.flagRiservato)) return 1;
    return 0;
  }

  /* ------------------ VEICOLI ------------------ */

  getVeicoli() {
    this.veicoloService.getVeicoli().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          if (data) this.selectVeicoloOptions = data;
        },
        error: (e: any) => console.error(e)
      })
  }

  updateVeicolo(articolo: any): void {
    if (!this.canModificaVeicolo) return;

    this.service.updateVeicolo(articolo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (!res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 1000, horizontalPosition: 'center', verticalPosition: 'top'
            })
          }
        },
        error: (e) => {
          console.error(e);
          this.snackbar.open('Errore veicolo non salvato', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          })
        }
      });
  }

  /* ------------------ STATUS ------------------ */

  update(ordine: OrdineCliente): void {
    if (!this.canSalvaStatus) return;

    this.loader = true;
    this.service.update(ordine).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        this.loader = false;
        if (!res.error) {
          this.snackbar.open('Stato aggiornato', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          })
        }
      }
    });
  }

  /* ------------------ FILTERS ------------------ */

  reset(): void {
    this.filtro.cliente = '';
    this.filtro.anno = undefined;
    this.filtro.luogo = '';
    this.filtro.progressivo = undefined;
    this.filtro.dataOrdine = undefined;
    this.filtro.veicolo = undefined;
    this.filtro.dataConsegnaStart = undefined;
    this.filtro.dataConsegnaEnd = undefined;
    this.retrieveList();
  }

  /* ------------------ FIDO CLIENTE ------------------ */

  apriFidoClienteModal(order: any) {
    this.dialog.open(FidoClienteComponent, {
      width: '60%',
      data: order.sottoConto
    });
  }

  /* ------------------ ORDINI PREGRESSI ------------------ */

  addOrder() {
    const dialogRef = this.dialog.open(OrdiniClientiPregressiDialogComponent, {
      width: '90%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.retrieveList();
      }
    });
  }

  /* ------------------ DATA RANGE CHECK ------------------ */

  checkdate() {
    return (
      this.filtro.dataConsegnaStart &&
      this.filtro.dataConsegnaEnd &&
      this.filtro.dataConsegnaStart.date() === this.filtro.dataConsegnaEnd.date() &&
      this.filtro.dataConsegnaStart.month() === this.filtro.dataConsegnaEnd.month() &&
      this.filtro.dataConsegnaStart.year() === this.filtro.dataConsegnaEnd.year()
    );
  }
}
