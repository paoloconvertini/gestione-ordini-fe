import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {Articolo} from "../../models/articolo";
import {OrdineClienteService} from "../../services/ordine-cliente/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../services/articolo.service";

@Component({
  selector: 'app-articolo',
  templateUrl: './articolo.component.html',
  styleUrls: ['./articolo.component.css']
})
export class ArticoloComponent extends CommonListComponent implements OnInit{

  ngOnInit(): void {
    this.retrieveList()
  }

  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo',
    'flRiservato', 'flOrdinato', 'dataUltimaModifica', 'utenteUltimaModifica'
  ];
  constructor(service: ArticoloService, dialog: MatDialog) {
    super(service, dialog);}

}
