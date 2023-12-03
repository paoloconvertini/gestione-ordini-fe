import {Component, Inject, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {takeUntil} from "rxjs";
import {CespiteService} from "../../../services/cespite/cespite.service";
import {FiltroOrdini} from "../../../models/FiltroOrdini";

@Component({
  selector: 'app-cespite-dialog',
  templateUrl: './cespite-dialog.component.html',
  styleUrls: ['./cespite-dialog.component.css']
})
export class CespiteDialogComponent extends CommonListComponent implements OnInit {
  isAdmin: boolean = false;
  displayedColumns: string[] = ['tipoCespite', 'progressivo', 'desc', 'azioni']
  filtro: FiltroOrdini = new FiltroOrdini();

  constructor(private service: CespiteService, private dialogRef: MatDialogRef<CespiteDialogComponent>,  @Inject(MAT_DIALOG_DATA) public data: string) {
    super();
    this.origin = data;
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAllCespiti(this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[]) => {
          this.createPaginator(data, 15);
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  aggiungi(tipoCespite: any) {
    this.dialogRef.close(tipoCespite);
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.tipoCespite.toLowerCase().includes(filter)
        || data.cespite.toLowerCase().includes(filter)
      )
    }
  }
}
