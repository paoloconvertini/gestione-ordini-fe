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
import {animate, state, style, transition, trigger} from "@angular/animations";
import {InviaEmailComponent} from "../invia-email/invia-email.component";
import {EmailDto} from "../../models/emailDto";

@Component({
  selector: 'app-lista-carichi-inviati',
  templateUrl: './lista-carichi-inviati.component.html',
  styleUrls: ['./lista-carichi-inviati.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListaCarichiInviatiComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numeroConvalida', 'azioni'];
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  filtro: FiltroCarichi = new FiltroCarichi();
  loaderDettaglio: boolean = false;
  selection = new SelectionModel<any>(true, []);
  expandedElement: any;
  carichi: any[] = [];

  constructor(private authService: AuthService, private emailService: EmailService, private router: ActivatedRoute, private service: ListaCarichiService, private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
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
  }


  retrieveList(): void {
    this.loader = true;
    this.service.searchConvalide(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
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

  retrieveCarichi(carico: any): void {
    if(this.expandedElement === carico){
      return;
    }
    this.loaderDettaglio = true;
    let filtro: FiltroCarichi = new FiltroCarichi();
    filtro.dataConvalida = carico.dataConvalida;
    filtro.numeroConvalida = carico.numeroConvalida;
    this.service.searchCarichiInviati(filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[]) => {
          this.loaderDettaglio = false;
          if(data) {
            this.carichi = data;
          }
        }
      })
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
  }

  reset():void {
    this.filtro.numeroOrdine = undefined;
    this.filtro.fornitore = undefined;
    this.filtro.dataConvalida = undefined;
    this.retrieveList();
  }

  downloadOrdine(convalida: any) {
    this.service.download(convalida.dataConvalida + "_" + convalida.numeroConvalida);
  }

  inviaMail(convalida: any) {
    {
      const dialogRef = this.dialog.open(InviaEmailComponent, {
        width: '30%',
        data: {email: null, update: false}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let dto = new EmailDto();
          dto.to = result.to;
          dto.id = convalida.dataConvalida + '_' + convalida.numeroConvalida;
          this.loader = true;
          this.emailService.inviaMailListaCarico(dto).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                }
              },
              error: (e) => {
                console.error(e);
                this.snackbar.open('Errore! Mail non inviata', 'Chiudi', {
                  duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
                })
                this.loader = false;
              }
            });
        }
      });
    }
  }
}
