import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {BaseComponent} from "../baseComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {ViewportScroller} from "@angular/common";
import {ScrollPositionService} from "../../services/scroll-position.service";
import {AuthService} from "../../services/auth/auth.service";
import {EmailService} from "../../services/email/email.service";
import {OrdineClienteService} from "../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {environment} from "../../../environments/environment";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {ListaService} from "../../services/ordine-cliente/logistica/lista.service";
import {ConsegneSettimanali} from "../../models/ConsegneSettimanali";
import {OrdineCliente} from "../../models/ordine-cliente";
import {ArticoloCliente} from "../../models/ArticoloCliente";
import {ConsegneGiornaliere} from "../../models/ConsegneGiornaliere";
import {ArticoloService} from "../../services/ordine-cliente/articolo/articolo.service";
import {HistoryDialogComponent} from "../history-dialog/history-dialog.component";
import {
  ConsegneSettimanaliDettaglioDialogComponent
} from "../consegne-settimanali-dettaglio-dialog/consegne-settimanali-dettaglio-dialog.component";

@Component({
  selector: 'app-consegne-settimanali',
  templateUrl: './consegne-settimanali.component.html',
  styleUrls: ['./consegne-settimanali.component.css']
})
export class ConsegneSettimanaliComponent extends BaseComponent implements OnInit{

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  loader = false;
  filtro: FiltroOrdini = new FiltroOrdini();
  user: any;
  consegne: ConsegneSettimanali = new ConsegneSettimanali();

  constructor(    private router: Router,
                  private viewportScroller: ViewportScroller,
                  private scrollPositionService: ScrollPositionService,
                  private authService: AuthService, private activatedRoute: ActivatedRoute,
                  private emailService: EmailService, private service: ListaService,
                  private articoloService: ArticoloService,
                  private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
    super();
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
    this.user = localStorage.getItem(environment.USERNAME);
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getConsegneSettimanali(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.consegne = data;
//          this.dataSource.data = data.list;
          this.loader = false;
        }
      })
  }

  dettaglio(consegna: any) {
    this.dialog.open(ConsegneSettimanaliDettaglioDialogComponent, {
      width: '90%',
      data: consegna,
      autoFocus: false,
      maxHeight: '90vh' //you can adjust the value as per your view
    });

  }

}
