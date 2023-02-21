import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {Articolo} from "../../models/articolo";
import {OrdineClienteService} from "../../services/ordine-cliente/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../services/articolo.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import {User} from "../../models/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-articolo',
  templateUrl: './articolo.component.html',
  styleUrls: ['./articolo.component.css']
})
export class ArticoloComponent extends CommonListComponent implements OnInit{

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: any) => {
        this.anno = params.anno;
        this.serie = params.serie;
        this.progressivo = params.progressivo;
    });
    this.getArticoliByOrdineId(this.anno, this.serie, this.progressivo);
  }

  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  anno: any;
  serie: any;
  progressivo: any;
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo',
    'flRiservato', 'flDisponibile', 'flOrdinato', 'dataUltimaModifica', 'utenteUltimaModifica'
  ];
  constructor(service: ArticoloService, dialog: MatDialog, snackbar: MatSnackBar, private router: ActivatedRoute, private authService: AuthService) {
    super(service, dialog, snackbar);
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

  salvaOrdine() {
    alert("Ordine salvato!");
  }

  approvaOrdine() {
    alert("Ordine approvato!");
  }
}
