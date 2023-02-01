import {Component, OnInit} from '@angular/core';
import {OrdineClienteService} from "../../../services/ordine-cliente/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../../commonListComponent";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {AddOrdineClienteComponent} from "../add-ordine/add-ordine-cliente.component";
import {Router} from "@angular/router";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-ordine-cliente',
  templateUrl: './ordine-cliente.component.html',
  styleUrls: ['./ordine-cliente.component.css']
})
export class OrdineClienteComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'cliente', 'data', 'azioni'];
  constructor(ordineService: OrdineClienteService, dialog: MatDialog, private router: Router) {
    super(ordineService, dialog);}



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
    this.router.navigate(['/articoli/'], {queryParams: {ordine:ordine.numero}})
  }
}
