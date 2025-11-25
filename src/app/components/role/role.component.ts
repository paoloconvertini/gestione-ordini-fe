import { Component, OnInit } from '@angular/core';
import { CommonListComponent } from "../commonListComponent";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { RoleService } from "../../services/role/role.service";
import { takeUntil } from "rxjs";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { Ruolo } from "../../models/Ruolo";
import { FiltroOrdini } from "../../models/FiltroOrdini";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['nome', 'azioni'];
  filtro: FiltroOrdini = new FiltroOrdini();

  // Permesso centrale
  canManageRoles: boolean = false;

  constructor(
    private service: RoleService,
    private router: Router,
    private dialog: MatDialog,
    private auth: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.canManageRoles = this.auth.hasPerm('roles.manage');
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;

    this.service.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: Ruolo[]) => {
          this.createPaginator(data, 100);

          if (this.filtro.searchText) {
            this.applyFilter();
          }

          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  creaNuovo(): void {
    if (!this.canManageRoles) return;

    const nuovo = new Ruolo();
    nuovo.edit = true;

    this.dataSource.data = [...this.dataSource.data, nuovo];
  }

  elimina(id: number): void {
    if (!this.canManageRoles) return;

    let msg = `Sei sicuro di voler eliminare questo ruolo? L'azione è irreversibile.`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: { msg }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.elimina(id)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res: any) => {
              if (!res.error) {
                this.retrieveList();
              }
            }
          });
      }
    });
  }

  salva(ruolo: Ruolo): void {
    if (!this.canManageRoles) return;

    if (ruolo.id) {
      this.service.update({ id: ruolo.id, name: ruolo.name })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.error) this.retrieveList();
          }
        });
    } else {
      this.service.save({ name: ruolo.name })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (!res.error) this.retrieveList();
          }
        });
    }
  }

  gestisciPermessi(ruolo: Ruolo): void {
    if (!this.canManageRoles) return;

    this.router.navigate(['/roles', ruolo.id, 'permissions']);
  }

  override applyFilter(): void {
    super.applyFilter(this.filtro.searchText);

    this.dataSource.filterPredicate = (data: any, filter: string): boolean =>
      data.name.toLowerCase().includes(filter);
  }
}
