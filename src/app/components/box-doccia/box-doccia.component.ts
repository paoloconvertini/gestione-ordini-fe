import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {takeUntil} from "rxjs";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../services/email/email.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {BoxDocciaService} from "../../services/box-doccia/box-doccia.service";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-box-doccia',
  templateUrl: './box-doccia.component.html',
  styleUrls: ['./box-doccia.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BoxDocciaComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['codice', 'descrizione', 'venduto'];
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  loaderDettaglio: boolean = false;
  expandedElement: any;
  filtro: FiltroOrdini = new FiltroOrdini();
  box: any = {};
  updateList: any = [];

  constructor(private authService: AuthService, private router: ActivatedRoute,
              private emailService: EmailService, private service: BoxDocciaService,
              private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
    super();
    if(localStorage.getItem(environment.LOGISTICA)){
      this.isLogistica = true;
    }
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
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 15);
          if(this.filtro.searchText){
            this.applyFilter();
          }
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  aggiungiLista(art: any) {
    if(this.updateList.includes(art.id)){
      this.updateList.splice(art.id, 1);
    } else {
      this.updateList.push(art.id);
    }

  }

  getDetail(articolo: any): void {
    this.loaderDettaglio = true;
    this.service.getDetail(articolo.id).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loaderDettaglio = false;
          if (res) {
            res.id = articolo.id;
            res.codice = articolo.codice;
            res.descrizione = articolo.descrizione;
            this.box = res;
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  update(): void {
    if(this.updateList.length === 0){
      return;
    }
    this.loader = true;
    this.service.save(this.updateList).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.retrieveList();
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.codice.toLowerCase().includes(filter)
        || data.descrizione.toLowerCase().includes(filter)
        || data.profilo?.toLowerCase().includes(filter)
        || data.estensibilita?.toLowerCase().includes(filter)
        || data.versione?.toLowerCase().includes(filter)
      )
    }
  }

}


