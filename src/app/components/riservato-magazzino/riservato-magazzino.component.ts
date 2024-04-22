import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {Option, OptStatus} from "../ordine-cliente/ordine-cliente-list/ordine-cliente.component";
import {ArticoloCliente} from "../../models/ArticoloCliente";
import {AuthService} from "../../services/auth/auth.service";
import {ListaService} from "../../services/ordine-cliente/logistica/lista.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrdineClienteService} from "../../services/ordine-cliente/list/ordine-cliente.service";
import {ArticoloService} from "../../services/ordine-cliente/articolo/articolo.service";
import {environment} from "../../../environments/environment";
import {takeUntil} from "rxjs";
import {OrdineCliente} from "../../models/ordine-cliente";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ImportoVenditore} from "../../models/ImportoVenditore";

@Component({
  selector: 'app-riservato-magazzino',
  templateUrl: './riservato-magazzino.component.html',
  styleUrls: ['./riservato-magazzino.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RiservatoMagazzinoComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'cliente', 'localita', 'data', 'status', 'totale'];
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();
  radioPerVenditoreOptions: Option[] = [];
  radioPerStatusOptions: OptStatus[] = [{codice: 'TUTTI', descrizione: 'TUTTI'},
    {codice: 'DA_PROCESSARE', descrizione: 'DA_PROCESSARE'},
    {codice: 'DA_ORDINARE', descrizione: 'DA_ORDINARE'},
    {codice: 'INCOMPLETO', descrizione: 'INCOMPLETO'},
    {codice: 'COMPLETO', descrizione: 'COMPLETO'}];
  stato: string = '';
  loaderDettaglio: boolean = false;
  expandedElement: any;
  articoli: ArticoloCliente[] = [];
  importiMap: any = new Map<string, number>();
  importiList: ImportoVenditore[] = [];

  constructor(private authService: AuthService, private service: ListaService,
              private dialog: MatDialog, private snackbar: MatSnackBar,
              private ordineClienteService: OrdineClienteService,  private articoloService: ArticoloService) {
    super();
    if(localStorage.getItem(environment.LOGISTICA)){
      this.filtro.status = 'COMPLETO';
      this.isLogistica = true;
    } else {
      this.filtro.status = 'TUTTI';
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
    this.service.getAllRiservati(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.importiMap = data.importoRiservatiMap;
          this.createPaginator(data.ordineDTOList, 100);
          if(this.filtro.searchText){
            this.applyFilter();
          }
          this.loader = false;
          if(!this.filtro.codVenditore) {
            this.getVenditori();
          }
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');
    this.authService.getVenditori(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.importiList = [];
        this.radioPerVenditoreOptions = data;
        let totale = 0;
        this.radioPerVenditoreOptions.forEach(opt => {
          let i = new ImportoVenditore();
          i.codice = opt.codVenditore;
          i.fullname = opt.fullname;
          if(opt.fullname === 'tutti') {
            i.import = totale;
          } else {
            i.import = this.importiMap[opt.codVenditore]?this.importiMap[opt.codVenditore]:0;
            totale += i.import;
          }
          this.importiList.push(i);
        })
      },
      error: (e: any) => {
        console.error(e);
      }

    })
  }

  refreshPage() {
    this.getVenditori();
    this.loader = true;
    this.ordineClienteService.aggiornaLista().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.retrieveList();
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  getArticoli(ordine: OrdineCliente) {
    if(this.expandedElement === ordine){
      return;
    }
    this.loaderDettaglio = true;
    this.articoloService.getArticoliRiservati(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: ArticoloCliente[]) => {
          if (data) {
            this.articoli = data;
          }
          this.loaderDettaglio = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loaderDettaglio = false;
        }
      })
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
