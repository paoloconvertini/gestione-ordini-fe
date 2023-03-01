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

  constructor(private route: ActivatedRoute,   ordineService: OrdineClienteService, dialog: MatDialog, snackbar: MatSnackBar, private router: Router) {
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
          this.upload(data);
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
          this.inviaMail(dto);
        }
      });
    }

  }
}
