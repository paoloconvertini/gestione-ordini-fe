import { Component, OnInit } from '@angular/core';
import { CommonListComponent } from "../../commonListComponent";
import { UserService } from "../../../services/users/user.service";
import { takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { Dipendente } from "../../../models/Dipendente";
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { FiltroOrdini } from "../../../models/FiltroOrdini";
import { AuthService } from "../../../services/auth/auth.service";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['username', 'nome', 'cognome', 'azioni'];

  filtro: FiltroOrdini = new FiltroOrdini();

  // Permessi
  canView: boolean = false;
  canManage: boolean = false;

  constructor(
    private service: UserService,
    private route: Router,
    private dialog: MatDialog,
    private auth: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    // 🔥 permessi centralizzati (non più localStorage)
    this.canView = this.auth.hasPerm('users.view');
    this.canManage = this.auth.hasPerm('users.manage');

    if (this.canView) {
      this.retrieveList();
    }
  }

  modifica(dipendente: Dipendente): void {
    if (!this.canManage) return;
    this.route.navigate(['/users-detail', dipendente.id]);
  }

  creaNuovo(): void {
    if (!this.canManage) return;
    this.route.navigate(['/users-detail']);
  }

  retrieveList(): void {
    if (!this.canView) return;

    this.loader = true;

    this.service.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Dipendente[] | undefined) => {
          this.createPaginator(data, 100);

          if (this.filtro.searchText) {
            this.applyFilter();
          }

          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  elimina(dipendente: Dipendente): void {
    if (!this.canManage) return;

    this.openConfirmDialog(null, null, dipendente.id);
  }

  openConfirmDialog(extraProp: any, preProp: any, data: any): void {
    let msg = '';
    if (preProp) msg += preProp;

    msg += `Sei sicuro di voler eliminare questo dipendente? L'azione è irreversibile.`;

    if (extraProp) msg += " " + extraProp;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: { msg }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.elimina(data)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res: any) => {
              if (!res.error) this.retrieveList();
            },
            error: (e: any) => console.error(e)
          });
      }
    });
  }

  override applyFilter(): void {
    super.applyFilter(this.filtro.searchText);

    const filter = this.filtro.searchText.toLowerCase();

    this.dataSource.filterPredicate = (data: any, f: string): boolean =>
      data.username?.toLowerCase().includes(f) ||
      data.name?.toLowerCase().includes(f) ||
      data.lastname?.toLowerCase().includes(f);
  }
}
