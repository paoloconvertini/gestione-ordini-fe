import {Component, OnInit, ViewChild} from '@angular/core';
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
import {ArticoloComponent} from "../articolo/articolo.component";


export interface Option {
  codVenditore: any,
  fullname: string,
  checked: boolean
}

@Component({
  selector: 'app-ordine-cliente',
  templateUrl: './ordine-cliente.component.html',
  styleUrls: ['./ordine-cliente.component.css']
})
export class OrdineClienteComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'cliente', 'data', 'azioni'];
  signImage: any;
  status?: string;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  radioPerVenditoreOptions: Option[] = [];
  filtro:any;
  user: any;

  constructor(private authService: AuthService, private router: ActivatedRoute, private emailService: EmailService, private service: OrdineClienteService, private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
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
    this.router.params.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => {
        this.status = params.status;
      }
    );
    if(this.isVenditore) {
      this.getVenditori();
    }
    this.retrieveList(this.status, false);
    this.user = localStorage.getItem(environment.USERNAME);
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');
    this.authService.getVenditori(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next:(data) => {
        this.radioPerVenditoreOptions = data;
      },
      error: (e: any) => {
        console.error(e);
      }

    })
  }

  retrieveList(status: any, update: boolean): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll(status, update).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[] | undefined) => {
            data?.forEach(d => {
              d.isLocked = d.locked && this.user !== d.userLock;
            })
            this.createPaginator(data);
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

  refreshPage() {
    if(this.isVenditore) {
      this.getVenditori();
    }
    this.retrieveList(this.status, true);
  }

  cercaPerVenditore():void {
    this.loader = true;
    this.service.filtra(this.status, this.filtro.codVenditore).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
      next: (data: any[] | undefined) => {
        data?.forEach(d => {
          d.isLocked = d.locked && this.user !== d.userLock;
        })
        this.createPaginator(data);
        this.loader = false;
      },
      error: (e: any) => {
        console.error(e);
        this.loader = false;
      }
    })
  }

  filtraPerVenditore():void {
    if(!this.filtro.codVenditore){
      this.retrieveList(this.status, false);
    } else {
      this.cercaPerVenditore();
    }
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
        this.route.navigate(['/ordini-clienti', 'DA_PROCESSARE']);
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
        width: '30%'
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
        data: {email: ordine.email}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let dto = new EmailDto();
          dto.to = result;
          dto.anno = ordine.anno;
          dto.serie = ordine.serie;
          dto.progressivo = ordine.progressivo;
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
    if (this.status) {
      url += "/" + this.status;
    }
    this.route.navigateByUrl(url);
  }

  vediDettaglio(ordine: OrdineCliente) {
    let url = "/articoli/view/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (this.status) {
      url += "/" + this.status;
    }
    this.route.navigateByUrl(url);
  }

  sbloccaOrdine(ordine: OrdineCliente) {
    this.loader = true;
    this.service.sbloccaOrdine(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if(res && !res.error) {
            this.refreshPage();
          }
          this.loader = false
        }, error: (e:any) => {
          console.log(e);
          this.loader = false;
        }
      })
  }
}
