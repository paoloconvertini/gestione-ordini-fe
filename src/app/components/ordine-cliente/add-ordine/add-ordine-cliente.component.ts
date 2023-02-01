import {Component, OnInit} from '@angular/core';
import {CommonAddComponent} from "../../commonAddComponent";
import {OrdineClienteService} from "../../../services/ordine-cliente/ordine-cliente.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-ordine-cliente',
  templateUrl: './add-ordine-cliente.component.html',
  styleUrls: ['./add-ordine-cliente.component.css']
})
export class AddOrdineClienteComponent extends CommonAddComponent implements OnInit{

  ordine:any

  ngOnInit(): void {
  }

  constructor(service: OrdineClienteService, _snackBar: MatSnackBar) {
    super(service, _snackBar);
  }

  override save(): void {
    super.save('Ordine aggiunto con successo!!', this.ordine);
  }
}
