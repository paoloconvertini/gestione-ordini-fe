import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {OrdineCliente} from "../../../models/ordine-cliente";

@Component({
  selector: 'app-oaf-list',
  templateUrl: './oaf-list.component.html',
  styleUrls: ['./oaf-list.component.css']
})
export class OafListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'fornitore', 'data', 'azioni'];
  status?: string;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;

  constructor(private router: ActivatedRoute, ordineService: OrdineFornitoreService, dialog: MatDialog, snackbar: MatSnackBar, route: Router) {
    super(ordineService, dialog, snackbar, route);
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


  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
        if (params.status === 'DA_APPROVARE') {
          this.status = 'T';
        } else if (params.status === 'APPROVATO') {
          this.status = 'F';
        } else {
          this.status = '';
        }
      this.retrieveFornitoreList(this.status, false);
      }
    );

  }

  refreshPage() {
    this.retrieveFornitoreList(this.status, true);
  }

  apriDettaglio(ordine: OrdineCliente) {
    let url = "/oaf/articoli/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (this.status) {
      url += "/" + this.status;
    }
    this.route.navigateByUrl(url);
  }

  override richiediApprovazione(ordine: OrdineCliente) {
    let data = {
      anno: ordine.anno,
      serie: ordine.serie,
      progressivo: ordine.progressivo,

    }
    super.richiediApprovazione(data);
  }

  richiediApprovazioneAll(){
    super.richiediApprovazione(this.dataSource.filteredData);
  }
}
