import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PianocontiService} from "../../../../services/pianoconti/pianoconti.service";
import {CommonListComponent} from "../../../commonListComponent";
import {map, startWith} from "rxjs";
import {FiltroOrdini} from "../../../../models/FiltroOrdini";
import {SelectionModel} from "@angular/cdk/collections";
import {Acconto} from "../../../../models/Acconto";
import {environment} from "../../../../../environments/environment";

export interface DialogData {
  acconti: any;
}

@Component({
  selector: 'app-acconto-dialog',
  templateUrl: './acconto-dialog.component.html',
  styleUrls: ['./acconto-dialog.component.css']
})
export class AccontoDialogComponent extends CommonListComponent implements OnInit{

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  selection = new SelectionModel<any>(true, []);
  acconti: Acconto[] = [];
  columnAcconti: string[] = ['select', 'dataFattura', 'numeroFattura', 'rifOrdCliente', 'operazione', 'prezzoAcconto', 'iva'];


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dialogRef: MatDialogRef<AccontoDialogComponent>) {
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
    this.acconti = this.data.acconti;
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

  aggiungi() {
    this.dialogRef.close(this.selection.selected);
  }

}
