import {Component, OnInit} from '@angular/core';
import {OrdineClienteService} from "../../../services/ordine-cliente/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../../commonListComponent";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {AddOrdineClienteComponent} from "../add-ordine/add-ordine-cliente.component";
import {Router} from "@angular/router";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-ordine-cliente',
  templateUrl: './ordine-cliente.component.html',
  styleUrls: ['./ordine-cliente.component.css']
})
export class OrdineClienteComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'cliente', 'data', 'azioni'];
  signImage: any;

  constructor(ordineService: OrdineClienteService, dialog: MatDialog, snackbar: MatSnackBar, private router: Router) {
    super(ordineService, dialog, snackbar);}



  ngOnInit(): void {
    this.retrieveList();
  }


  openDialog() {
    {
      const dialogRef = this.dialog.open(AddOrdineClienteComponent, {
        width: '30%'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.retrieveList();
        }
        console.log('The dialog was closed');

      });
    }
  }

  detail(ordine: OrdineCliente) {
    this.router.navigate(['/articoli/'], {
      queryParams: {
        anno:ordine.anno,
        serie:ordine.serie,
        progressivo:ordine.progressivo,
      }
    })
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
          this.upload(data);
        }
        console.log('The dialog was closed');

      });
    }
  }
}
