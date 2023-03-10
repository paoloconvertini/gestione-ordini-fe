import {Component, OnInit} from '@angular/core';
import {OrdineClienteService} from "../../../services/ordine-cliente/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../../commonListComponent";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {AddOrdineClienteComponent} from "../add-ordine/add-ordine-cliente.component";
import {ActivatedRoute, Router} from "@angular/router";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {EmailDto} from "../../../models/emailDto";
import {InviaEmailComponent} from "../../invia-email/invia-email.component";
import {EmailService} from "../../../services/email/email.service";

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

  constructor(private route: ActivatedRoute, private emailService: EmailService,  ordineService: OrdineClienteService, dialog: MatDialog, snackbar: MatSnackBar, private router: Router) {
    super(ordineService, dialog, snackbar);
    if(localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    if(localStorage.getItem(environment.MAGAZZINIERE)) {
      this.isMagazziniere = true;
    }
    if(localStorage.getItem(environment.AMMINISTRATIVO)) {
      this.isAmministrativo = true;
    }
    if(localStorage.getItem(environment.VENDITORE)) {
      this.isVenditore = true;
    }
  }



  ngOnInit(): void {
    this.route.params.subscribe((params:any) => {
          this.status = params.status;
        }
      );
    if(this.status) {
      this.retrieveList(this.status);
    } else {
      this.retrieveList(null);
    }

  }

  refreshPage() {
    this.retrieveList(this.status);
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
          if(localStorage.getItem(environment.USERNAME)) {
            // @ts-ignore
            data.append('username', localStorage.getItem(environment.USERNAME));
          }
          this.loader = true;
          this.upload(data).subscribe({
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

  inviaEmail(ordine:OrdineCliente) {
    {
      const dialogRef = this.dialog.open(InviaEmailComponent, {
        width: '30%'
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
                this.snackbar.open('Successo! Email inviata', 'Chiudi', {
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

          ;
        }
      });
    }

  }

  apriDettaglio(ordine:OrdineCliente) {
    let url = "/articoli/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if(this.status) {
      url += "/" + this.status;
    }
    this.router.navigateByUrl(url);
  }
}
