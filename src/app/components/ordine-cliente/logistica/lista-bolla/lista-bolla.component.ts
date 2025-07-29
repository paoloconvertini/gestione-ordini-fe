import {Component, Inject, OnInit} from '@angular/core';
import {FiltroOrdini} from "../../../../models/FiltroOrdini";
import {ArticoloCliente} from "../../../../models/ArticoloCliente";
import {AuthService} from "../../../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../../../services/email/email.service";
import {ListaService} from "../../../../services/ordine-cliente/logistica/lista.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrdineClienteService} from "../../../../services/ordine-cliente/list/ordine-cliente.service";
import {ArticoloService} from "../../../../services/ordine-cliente/articolo/articolo.service";
import {environment} from "../../../../../environments/environment";
import {takeUntil} from "rxjs";
import {OrdineCliente} from "../../../../models/ordine-cliente";
import {CommonListComponent} from "../../../commonListComponent";
import {SelectionModel} from "@angular/cdk/collections";
import {animate, state, style, transition, trigger} from "@angular/animations";

export interface DialogData {
  ordini: any;
}

@Component({
  selector: 'app-lista-bolla',
  templateUrl: './lista-bolla.component.html',
  styleUrls: ['./lista-bolla.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ListaBollaComponent extends CommonListComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'cliente', 'localita', 'data', 'status', 'azioni'];
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();
  selection = new SelectionModel<any>(true, []);
  loaderDettaglio: boolean = false;
  expandedElement: any;
  articoli: ArticoloCliente[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dialogRef: MatDialogRef<ListaBollaComponent>, private authService: AuthService, private router: ActivatedRoute,
              private emailService: EmailService, private service: ListaService,
              private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router,
              private ordineClienteService: OrdineClienteService,  private articoloService: ArticoloService) {
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
    this.createPaginator(this.data.ordini, 100);
  }

  onNoClick(): void {
    this.dialogRef.close(true);
  }

  onAnnullaClick(): void {
    this.dialogRef.close(false);
  }

  aggiungi() {
    let list = this.selection.selected.filter(row => row.tipoRigo !=='C' && row.tipoRigo !=='AC');
    this.dialogRef.close(list);
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.articoli.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.articoli);
  }

  getArticoli(ordine: OrdineCliente) {
    if(this.expandedElement === ordine) {
      return;
    }
    this.loaderDettaglio = true;
    this.articoloService.getArticoli("Y", ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: ArticoloCliente[]) => {
          if (data) {
            ordine.articoli = data;
          }
          this.loaderDettaglio = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loaderDettaglio = false;
        }
      })
  }


  mostraNonDisponibile(articolo:any):number {
    if( articolo.tipoRigo !== '' && articolo.tipoRigo !== ' ') {
      return 2;
    } else if(articolo.flagNonDisponibile || (articolo.flagOrdinato && !articolo.flagRiservato)) {
      return 1;
    } else {
      return 0;
    }
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.intestazione.toLowerCase().includes(filter)
        || data.serie.toLowerCase().includes(filter)
        || data.dataConferma.includes(filter)
        || data.localita.toLowerCase().includes(filter)
        || data.anno.toString().toLowerCase().includes(filter)
        || data.progressivo.toString().toLowerCase().includes(filter)
      )
    }
  }

}
