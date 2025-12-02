import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CommonListComponent} from "../../../commonListComponent";
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
  selection = new SelectionModel<any>(true, []);
  acconti: Acconto[] = [];
  columnAcconti: string[] = ['select', 'dataFattura', 'numeroFattura', 'rifOrdCliente', 'operazione', 'prezzoAcconto', 'iva'];


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private dialogRef: MatDialogRef<AccontoDialogComponent>) {
    super();
  }

  ngOnInit(): void {
    this.acconti = this.data.acconti;
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.acconti.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.acconti);
  }

  onNoClick(): void {
    this.dialogRef.close(true);
  }

  onAnnullaClick(): void {
    this.dialogRef.close(false);
  }

  aggiungi() {
    this.dialogRef.close(this.selection.selected);
  }

}
