import {Component, Inject, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../../environments/environment";
import {takeUntil} from "rxjs";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";
import {ActivatedRoute} from "@angular/router";
import {OrdineClienteNotaDto} from "../../../models/OrdineClienteNotaDto";
import {AuthService} from "../../../services/auth/auth.service";

@Component({
  selector: 'app-tipocespite-dialog',
  templateUrl: './tipocespite-dialog.component.html',
  styleUrls: ['./tipocespite-dialog.component.css']
})
export class TipocespiteDialogComponent extends CommonListComponent implements OnInit {
  isAdmin: boolean = false;
  displayedColumns: string[] = ['tipoCespite', 'descrizione', 'gruppoConto', 'sottoConto', 'azioni']

  constructor(@Inject(MAT_DIALOG_DATA) public data: string, private authService: AuthService,
              private service: TipocespiteService, private dialogRef: MatDialogRef<TipocespiteDialogComponent>, private router: ActivatedRoute) {
    super();
    if (this.authService.hasRole('Admin')) {
      this.isAdmin = true;
    }
    this.origin = data;
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll(this.origin).pipe(takeUntil(this.ngUnsubscribe))
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
}
