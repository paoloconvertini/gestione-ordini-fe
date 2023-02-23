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

@Component({
  selector: 'app-ordine-cliente',
  templateUrl: './ordine-cliente.component.html',
  styleUrls: ['./ordine-cliente.component.css']
})
export class OrdineClienteComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'cliente', 'data', 'azioni'];
  signImage: any;
  status?: string;

  constructor(private route: ActivatedRoute,   ordineService: OrdineClienteService, dialog: MatDialog, snackbar: MatSnackBar, private router: Router) {
    super(ordineService, dialog, snackbar);
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
}
