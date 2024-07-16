import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../services/email/email.service";
import {OrdineClienteService} from "../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {environment} from "../../../environments/environment";
import {ListaCarichiService} from "../../services/lista-carichi/lista-carichi.service";
import {Deposito} from "../../models/deposito";
import {Trasportatore} from "../../models/trasportatore";
import {SelectionModel} from "@angular/cdk/collections";
import {FiltroCarichi} from "../../models/FiltroCarichi";

@Component({
  selector: 'app-lista-carichi',
  templateUrl: './lista-carichi.component.html',
  styleUrls: ['./lista-carichi.component.css']
})
export class ListaCarichiComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['select', 'azienda', 'numeroOrdine', 'deposito', 'dataDisponibilita', 'peso', 'trasportatore', 'numeroConvalida'];
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  filtro: FiltroCarichi = new FiltroCarichi();
  selection = new SelectionModel<any>(true, []);

  constructor(private authService: AuthService, private router: ActivatedRoute, private service: ListaCarichiService, private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      this.filtro.inviato = params.inviato;
    });
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
    if (localStorage.getItem(environment.LOGISTICA)) {
      this.isLogistica = true;
    }
  }


  ngOnInit(): void {
    this.retrieveList();
  }


  retrieveList(): void {
    this.loader = true;
    this.service.searchAllCarichi(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 100);
          this.loader = false;
          if(this.filtro.searchText){
            this.applyFilter();
          }
        }
      })
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.azienda.toLowerCase().includes(filter)
        || data.numeroOrdine.toLowerCase().includes(filter)
        || data.deposito.toLowerCase().includes(filter)
        || data.trasportatore.toLowerCase().includes(filter)
      )
    }
  }

  vediDettaglio(carico: any) {
    let url = '/carico-detail/edit/' + this.filtro.inviato + '/' + carico.id;
    this.route.navigateByUrl(url);
  }


  creaNuovo() {
    let url = '/carico-detail/' + this.filtro.inviato;
    this.route.navigateByUrl(url);
  }

  convalida() {
    this.loader = true;
    this.service.convalida(this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.loader = false;
          if(data && !data.error) {
            this.generaPdf(data.msg);
            this.retrieveList();
          } else {
            this.snackbar.open("Errore nella creazione della lista di carico", 'Chiudi', {
              duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            });
          }
        }
      })
  }

  generaPdf(id:number) {
    this.service.generaPdf(id);
  }

  reset():void {
    this.filtro.searchText = '';
    this.filtro.dataDisponibile = undefined;
    this.retrieveList();
  }
}
