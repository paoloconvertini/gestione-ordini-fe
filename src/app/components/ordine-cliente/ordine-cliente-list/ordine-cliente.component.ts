import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {OrdineClienteService} from "../../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../../commonListComponent";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {ActivatedRoute, Router, Scroll} from "@angular/router";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {EmailDto} from "../../../models/emailDto";
import {InviaEmailComponent} from "../../invia-email/invia-email.component";
import {EmailService} from "../../../services/email/email.service";
import {AuthService} from "../../../services/auth/auth.service";
import {filter, takeUntil} from "rxjs";
import {OrdineClienteNotaDto} from "../../../models/OrdineClienteNotaDto";
import {OrdineClienteNoteDialogComponent} from "../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {MatPaginator, MatPaginatorIntl, PageEvent} from "@angular/material/paginator";
import {BaseComponent} from "../../baseComponent";
import {MatTableDataSource} from "@angular/material/table";
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {ViewportScroller} from "@angular/common";
import { ScrollPositionService } from '../../../services/scroll-position.service';
import {OrdiniClientiStateService} from "../../../services/state/ordini-clienti-state.service";
import {PermissionService} from "../../../services/auth/permission.service";
import {DownloadUtil} from "../../../utils/download-util";


export interface Option {
  codVenditore: any,
  fullname: string,
  checked: boolean
}

export interface OptStatus {
  codice: any,
  descrizione: string
}

@Component({
  selector: 'app-ordine-cliente',
  templateUrl: './ordine-cliente.component.html',
  styleUrls: ['./ordine-cliente.component.css']
})
export class OrdineClienteComponent extends BaseComponent implements OnInit, AfterViewInit {

  loader = false;
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  _intl: MatPaginatorIntl = new MatPaginatorIntl();
  displayedColumns: string[] = ['numero', 'cliente', 'localita', 'data', 'status', 'azioni'];
  signImage: any;
  radioPerVenditoreOptions: Option[] = [];
  radioPerStatusOptions: OptStatus[] = [];
  selectStatusOptions: OptStatus[] = [];
  filtro: FiltroOrdini = new FiltroOrdini();
  user: any;
  countHasCarico: number = 0;
  totalItems = 0;

  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private viewportScroller: ViewportScroller,
    private scrollPositionService: ScrollPositionService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private emailService: EmailService,
    private service: OrdineClienteService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    public perm: PermissionService,
    private downloadUtil: DownloadUtil,
    private state: OrdiniClientiStateService) {
    super();
  }

  ngOnInit(): void {
    console.log('[INIT] filtroStatus iniziale =', this.filtro.filtroStatus);
    // 1️⃣ Carichiamo lo stato salvato (filtri + pagina + status)
    this.filtro = this.state.getState();

    // 2️⃣ Ruoli: logica invariata → carica venditori se serve

    if (this.perm.canFiltroVenditore) {
      this.getVenditori();
    }
    console.log('[BEFORE getStati] filtroStatus =', this.filtro.filtroStatus);

    // 3️⃣ Carica elenco stati ordine (TUTTI, DA_PROCESSARE, ...)
    this.getStati();

    // 4️⃣ Utente loggato
    this.user = this.authService.getCurrentUser()?.username;

    // 5️⃣ Carichiamo la lista iniziale con i filtri già ripristinati
    this.retrieveList();
  }


  ngAfterViewInit(): void {
    const scrollPosition = this.scrollPositionService.getScrollPosition();
    console.log("afterView: " + scrollPosition);
    this.viewportScroller.scrollToPosition([0, scrollPosition]);
  }

  onPageChange(event: PageEvent) {
    this.filtro.page = event.pageIndex;
    this.filtro.size = event.pageSize;
    this.state.setState(this.filtro);
    this.retrieveList();
  }

  cerca(): void {
    this.filtro.page = 0;
    this.state.setState(this.filtro);
    this.retrieveList();
  }

  reset(): void {
    this.state.resetState();
    this.filtro = this.state.getState(); // default
    this.retrieveList();
  }

// -----------------------------------------------
// RESET SOLO PAGINA (quando cambi un filtro)
// -----------------------------------------------
  resetPage() {
    this.filtro.page = 0;

    // Aggiorna stato ma NON richiama retrieveList (lo farà chi invoca)
    this.state.setState(this.filtro);
  }


// -----------------------------------------------
// CARICA LISTA DAL BACKEND (USANDO FILTRI DEL SERVICE)
// -----------------------------------------------
  retrieveList(): void {
    this.loader = true;
    this.countHasCarico = 0;

    // Stato sempre allineato
    this.state.setState(this.filtro);

    this.service.getAll(this.filtro)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.totalItems = data.count;

          data.list?.forEach((d: any) => {
            d.isLocked = d.locked && this.user !== d.userLock;
            if (d.hasCarico) this.countHasCarico++;
          });

          this.dataSource.data = data.list;
          this.loader = false;
        },
        error: (err) => {
          console.error(err);
          this.loader = false;
        }
      });
  }


  update(ordine: OrdineCliente): void {
    this.loader = true;
    this.service.update(ordine).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.snackbar.open('Stato aggiornato', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            })
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  getStati(): void {
    this.service.getStati().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        console.log('[getStati] filtroStatus PRIMA if =', this.filtro.filtroStatus);

        this.radioPerStatusOptions = data;
        if (!this.filtro.filtroStatus) {
          console.log('[getStati] filtroStatus ERA FALSY → set TUTTI');
          this.filtro.filtroStatus = 'TUTTI';
        }
        console.log('[getStati] filtroStatus DOPO if =', this.filtro.filtroStatus);

        this.selectStatusOptions = data.filter((e: any) => e.descrizione !== 'TUTTI');
        this.cdRef.detectChanges(); // forza aggiornamento binding
      },
      error: (e: any) => {
        console.error(e);
      }
    })
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');
    this.authService.getVenditori(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.radioPerVenditoreOptions = data;
        this.cdRef.detectChanges(); // forza aggiornamento binding
      },
      error: (e: any) => {
        console.error(e);
      }

    })
  }

  refreshPage() {
    if (this.perm.canFiltroVenditore) {
      this.getVenditori();
    }
    this.loader = true;
    this.service.aggiornaLista().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
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

  apri(ordine: OrdineCliente): void {
    this.loader = true;
    this.service.apriOrdine(ordine.anno, ordine.serie, ordine.progressivo, 'DA_PROCESSARE').pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && !res.error) {
            this.snackbar.open('Ordine riaperto', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            })
          }
          ordine.status = "DA_PROCESSARE";
          this.editDettaglio(ordine);
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

  apriFirma(ordine: OrdineCliente) {
    let ordineId = ordine.anno + '_' +
      ordine.serie + '_' + ordine.progressivo;
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
          this.service.upload(data).subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Ordine firmato. Puoi trovare il pdf nella cartella condivisa', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
              this.refreshPage();
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

  inviaEmail(ordine: OrdineCliente) {
    {
      const dialogRef = this.dialog.open(InviaEmailComponent, {
        width: '30%',
        data: {email: ordine.email, update: true}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let dto = new EmailDto();
          dto.to = result.to;
          dto.anno = ordine.anno;
          dto.serie = ordine.serie;
          dto.progressivo = ordine.progressivo;
          dto.sottoConto = ordine.sottoConto;
          dto.update = result.update;
          this.loader = true;
          this.emailService.inviaMail(dto).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
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


  openDettaglio(ordine: any) {
    // locked = sempre sola lettura
    if (ordine.isLocked) {
      this.vediDettaglio(ordine);
      return;
    }

    // archiviato = sempre sola lettura
    if (ordine.status === 'ARCHIVIATO') {
      this.vediDettaglio(ordine);
      return;
    }

    // altrimenti edit
    this.editDettaglio(ordine);
  }

  editDettaglio(ordine: OrdineCliente) {
    this.apriDettaglio('edit', ordine);
  }

  vediDettaglio(ordine: OrdineCliente) {
    this.apriDettaglio('view', ordine);
  }

  private apriDettaglio(mode: 'edit' | 'view', ordine: OrdineCliente) {
    // salva filtri
    this.filtro.statusOrdine = ordine.status;
    this.state.setState(this.filtro);

    // salva posizione scroll
    this.scrollPositionService.setScrollPosition(window.scrollY);

    // costruisci URL minimale
    const url = `/articoli/${mode}/${ordine.anno}/${ordine.serie}/${ordine.progressivo}`;

    this.router.navigateByUrl(url);
  }


  sbloccaOrdine(ordine: OrdineCliente) {
    this.loader = true;
    this.service.sbloccaOrdine(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (res && !res.error) {
            this.retrieveList();
          }
          this.loader = false
        }, error: (e: any) => {
          console.log(e);
          this.loader = false;
        }
      })
  }

  aggiungiNote(ordine: OrdineCliente, from: number) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    if (from === 0) {
      data.note = ordine.note;
      data.userNote = ordine.userNote;
      data.dataNote = ordine.dataNote;
    } else {
      if (!this.perm.canNoteLogistica) return;
      data.note = ordine.noteLogistica;
      data.userNoteLogistica = ordine.userNoteLogistica;
      data.dataNoteLogistica = ordine.dataNoteLogistica;
    }

    {
      const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
        width: '50%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loader = true;
          this.service.addNotes(result, from).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                  if (from === 0) {
                    ordine.note = result.note;
                  } else {
                    ordine.noteLogistica = result.note;
                  }
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

  downloadOrdine(ordine: OrdineCliente) {
    this.downloadUtil.handleDownload(this.service.download(ordine));
  }

  cercaBolle() {
    if (this.perm.canFiltroVenditore) {
      this.getVenditori();
    }
    this.loader = true;
    this.service.cercaBolle().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.totalItems = data.count;
          data.list?.forEach((d: any) => {
            d.isLocked = d.locked && this.user !== d.userLock;
          })
          this.dataSource = new MatTableDataSource(data.list);
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }


}
