import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OafArticoloService} from "../../../services/ordine-fornitore/dettaglio/oaf-articolo.service";

@Component({
  selector: 'app-oaf-dettaglio',
  templateUrl: './oaf-dettaglio.component.html',
  styleUrls: ['./oaf-dettaglio.component.css']
})
export class OafDettaglioComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  anno: any;
  serie: any;
  progressivo: any;
  status: any;
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo', 'azioni'];

  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
      this.anno = params.anno;
      this.serie = params.serie;
      this.progressivo = params.progressivo;
      this.status = params.status;
    });
    this.getOafArticoliByOrdineId(this.anno, this.serie, this.progressivo);
  }

  constructor(service: OafArticoloService, dialog: MatDialog, snackbar: MatSnackBar, route: Router, private router: ActivatedRoute) {
    super(service, dialog, snackbar, route);
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

  approva() {
    this.loader = true;
    this.approvaOrdine(this.anno, this.serie, this.progressivo).subscribe({
      next: (res) => {
        this.loader = false;
        if(!res.error) {
          this.route.navigate(['/ordini-fornitore', 'APPROVATO'])
        }
      }, error: (e) => {
        console.error(e);
        this.loader = false;
      }
    })
  }

  salvaOrdine() {
    this.updateOafArticoli(this.anno, this.serie, this.progressivo, this.dataSource.filteredData);
  }

  override richiediApprovazione() {
    let data = {
      anno: this.anno,
      serie: this.serie,
      progressivo: this.progressivo,

    }
    super.richiediApprovazione(data);
  }
}
