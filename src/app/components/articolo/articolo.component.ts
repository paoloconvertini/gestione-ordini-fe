import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {Articolo} from "../../models/articolo";
import {OrdineClienteService} from "../../services/ordine-cliente/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../services/articolo.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-articolo',
  templateUrl: './articolo.component.html',
  styleUrls: ['./articolo.component.css']
})
export class ArticoloComponent extends CommonListComponent implements OnInit{

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: any) => {
        this.ordine = params.ordine;
    });
    this.getById(this.ordine);
  }

  ordine: any;
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo',
    'flRiservato', 'flDisponibile', 'flOrdinato', 'dataUltimaModifica', 'utenteUltimaModifica'
  ];
  constructor(service: ArticoloService, dialog: MatDialog, private router: ActivatedRoute) {
    super(service, dialog);}

  salvaOrdine() {
    alert("Ordine salvato!");
  }
}
