import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {OrdineClienteService} from "../../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../../commonListComponent";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {ActivatedRoute, Router} from "@angular/router";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {EmailDto} from "../../../models/emailDto";
import {InviaEmailComponent} from "../../invia-email/invia-email.component";
import {EmailService} from "../../../services/email/email.service";
import {AuthService} from "../../../services/auth/auth.service";
import {takeUntil} from "rxjs";
import {OrdineClienteNotaDto} from "../../../models/OrdineClienteNotaDto";
import {OrdineClienteNoteDialogComponent} from "../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {MatPaginator, MatPaginatorIntl, PageEvent} from "@angular/material/paginator";
import {BaseComponent} from "../../baseComponent";
import {MatTableDataSource} from "@angular/material/table";


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
export class OrdineClienteComponent extends BaseComponent implements OnInit {

  loader = false;
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  _intl: MatPaginatorIntl = new MatPaginatorIntl ();
  displayedColumns: string[] = ['numero', 'cliente', 'localita', 'data', 'status', 'azioni'];
  signImage: any;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  radioPerVenditoreOptions: Option[] = [];
  radioPerStatusOptions: OptStatus[] = [];
  selectStatusOptions: OptStatus[] = [];
  filtro: FiltroOrdini = new FiltroOrdini();
  user: any;
  countHasCarico: number = 0;
  totalItems = 0;

  constructor(private authService: AuthService, private router: ActivatedRoute, private emailService: EmailService, private service: OrdineClienteService, private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
    super();
    this._intl.itemsPerPageLabel = 'Elementi per pagina';
    this._intl.nextPageLabel = 'Prossima';
    this._intl.previousPageLabel = 'Precedente';
    this._intl.firstPageLabel = 'Prima';
    this._intl.lastPageLabel = 'Ultima';
    this.router.params.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => {
          if (params.status) {
            this.filtro.status = params.status;
          } else {
            if(localStorage.getItem(environment.LOGISTICA)){
              this.filtro.status = 'COMPLETO';
            } else {
              this.filtro.status = 'TUTTI';
            }
          }
        }
      );
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
    if (localStorage.getItem(environment.LOGISTICA)) {
      this.isLogistica = true;
    }
  }


  ngOnInit(): void {
    this.getStati();
    if (this.isVenditore || this.isAdmin) {
      this.getVenditori();
    }
    this.retrieveList();
    this.user = localStorage.getItem(environment.USERNAME);
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
        this.radioPerStatusOptions = data;
        if(!this.filtro.status){
          this.filtro.status = 'TUTTI';
        }
        this.selectStatusOptions = data.filter( (e:any) => e.descrizione !== 'TUTTI');
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
      },
      error: (e: any) => {
        console.error(e);
      }

    })
  }

  onPageChange(event: PageEvent) {
    this.filtro.page = event.pageIndex;
    this.filtro.size = event.pageSize;
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.countHasCarico = 0;
      this.service.getAll(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any | undefined) => {
            this.totalItems = data.count;
            data.list?.forEach((d: any) => {
              d.isLocked = d.locked && this.user !== d.userLock;
              if(d.hasCarico){
                this.countHasCarico++;
              }
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

  refreshPage() {
    if (this.isVenditore || this.isAdmin) {
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

  editDettaglio(ordine: OrdineCliente) {
    let url = "/articoli/edit/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (ordine.status) {
      url += "/" + ordine.status;
    }
    this.route.navigateByUrl(url);
  }

  vediDettaglio(ordine: OrdineCliente) {
    let url = "/articoli/view/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (ordine.status) {
      url += "/" + ordine.status;
    }
    this.route.navigateByUrl(url);
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
    if(from === 0) {
      data.note = ordine.note;
      data.userNote = ordine.userNote;
      data.dataNote = ordine.dataNote;
    } else {
      if(!this.isLogistica && !this.isAdmin) {
        return;
      }
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
                  if(from === 0) {
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
    this.service.download(ordine);
  }

  cercaBolle() {
    if (this.isVenditore || this.isAdmin) {
      this.getVenditori();
    }
    this.loader = true;
      this.service.cercaBolle().pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[] | undefined) => {
            data?.forEach(d => {
              d.isLocked = d.locked && this.user !== d.userLock;
            })
            this.filtro.status = '';
            this.getStati();
            //super().createPaginator(data, this.filtro.size);
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
  }

  reset() {
    this.filtro.cliente = '';
    this.filtro.anno = undefined;
    this.filtro.luogo = '';
    this.filtro.progressivo = undefined;
    this.filtro.dataOrdine = undefined;
    this.retrieveList();
  }
}
