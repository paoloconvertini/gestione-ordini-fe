import {Component, OnInit} from '@angular/core';
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


export interface Option {
  codice: any,
  name: string,
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
  radioPerVenditoreOptions: Option[] = [{codice: "11", name: "Damiano", checked: true},
    {codice: "Rocco", name: "Rocco", checked: false},
    {codice: "Piero", name: "Piero", checked: false},
    {codice: "Antoniana", name: "Antoniana", checked: false},
    {codice: "Francesco", name: "Francesco", checked: false},
    {codice: "", name: "Angela", checked: false}
  ];

  constructor(private router: ActivatedRoute, private emailService: EmailService, private service: OrdineClienteService, private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
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
    this.router.params.subscribe((params: any) => {
        this.status = params.status;
      }
    );
    this.retrieveList(this.status, false);
  }

  retrieveList(status: any, update: boolean): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll(status, update)
        .subscribe({
          next: (data: any[] | undefined) => {
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
    this.retrieveList(this.status, true);
  }



  apri(ordine: OrdineCliente): void {
    this.loader = true;
    this.service.apriOrdine(ordine.anno, ordine.serie, ordine.progressivo, 'DA_PROCESSARE').subscribe({
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
          this.emailService.inviaMail(dto).subscribe({
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

  apriDettaglio(ordine: OrdineCliente) {
    let url = "/articoli/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (this.status) {
      url += "/" + this.status;
    }
    this.route.navigateByUrl(url);
  }
}
