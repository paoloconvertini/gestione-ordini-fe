import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../../environments/environment";
import {takeUntil} from "rxjs";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";

@Component({
  selector: 'app-tipocespite-dialog',
  templateUrl: './tipocespite-dialog.component.html',
  styleUrls: ['./tipocespite-dialog.component.css']
})
export class TipocespiteDialogComponent extends CommonListComponent implements OnInit {
  isAdmin: boolean = false;
  displayedColumns: string[] = ['tipoCespite', 'descrizione', 'gruppoConto', 'sottoConto', 'azioni']

  constructor(private service: TipocespiteService, private dialogRef: MatDialogRef<TipocespiteDialogComponent>) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll().pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[]) => {
            this.createPaginator(data, 5);
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  aggiungi(tipoCespite: any) {
    this.dialogRef.close(tipoCespite);
  }
}
