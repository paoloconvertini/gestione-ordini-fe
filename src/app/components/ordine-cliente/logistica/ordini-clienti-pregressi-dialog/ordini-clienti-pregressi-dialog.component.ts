import {Component, Inject, OnInit} from '@angular/core';
import {CommonListComponent} from "../../../commonListComponent";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../../../environments/environment";
import {DialogData} from "../acconto-dialog/acconto-dialog.component";
import {
  OrdineClienteNoteDialogComponent
} from "../../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {SelectionModel} from "@angular/cdk/collections";
import {FiltroOrdini} from "../../../../models/FiltroOrdini";
import {takeUntil} from "rxjs";
import {ListaService} from "../../../../services/ordine-cliente/logistica/lista.service";
import {Option} from "../../ordine-cliente-list/ordine-cliente.component";
import {AuthService} from "../../../../services/auth/auth.service";

@Component({
  selector: 'app-ordini-clienti-pregressi-dialog',
  templateUrl: './ordini-clienti-pregressi-dialog.component.html',
  styleUrls: ['./ordini-clienti-pregressi-dialog.component.css']
})
export class OrdiniClientiPregressiDialogComponent extends CommonListComponent implements OnInit{

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  selection = new SelectionModel<any>(true, []);
  columnOrdini: string[] = ['select', 'numero', 'cliente', 'localita', 'data'];
  filtro: FiltroOrdini = new FiltroOrdini();
  radioPerVenditoreOptions: Option[] = [];


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private authService: AuthService, private dialogRef: MatDialogRef<OrdineClienteNoteDialogComponent>,
              private service: ListaService) {
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
    this.getVenditori();
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');
    this.authService.getVenditori(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.radioPerVenditoreOptions = data;
      },
      error: (e: any) => {
        console.error(e);
      }

    })
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAllPregressi(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 100);
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  salva() {
    this.loader = true;
    this.service.savePregressi(this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          if(data) {
            this.dialogRef.close();
          }
          this.loader = false;
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
