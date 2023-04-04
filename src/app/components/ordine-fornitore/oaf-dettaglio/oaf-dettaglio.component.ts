import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {OrdineClienteService} from "../../../services/ordine-cliente/list/ordine-cliente.service";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {ArticoloService} from "../../../services/ordine-cliente/articolo/articolo.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {Option} from "../../ordine-cliente/articolo/articolo.component";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
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

  constructor(service: OafArticoloService, dialog: MatDialog, snackbar: MatSnackBar, private router: ActivatedRoute, private route: Router) {
    super(service, dialog, snackbar);
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
    this.approvaOrdine(this.anno, this.serie, this.progressivo);
  }

  salvaOrdine() {
    this.updateOafArticoli(this.anno, this.serie, this.progressivo, this.dataSource.filteredData);
  }

  chiudiOrdine() {
    this.openConfirmDialog(null, null);
  }

  openConfirmDialog(extraProp: any, preProp: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di aver processato correttamente tutti gli articoli';
    if (extraProp) {
      msg += " ";
      msg += extraProp;
    }
    msg += '?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chiudi(this.dataSource.filteredData).subscribe({
          next: (res) => {
            if (!res.error) {
              let url = '/ordini-fornitore';
              if (res.msg) {
                url += '/' + res.msg;
              }
              this.route.navigate([url]);
            }
          },
          error: (e) => console.error(e)
        });
      }
    });
  }
}
