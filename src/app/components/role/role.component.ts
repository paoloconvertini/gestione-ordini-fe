import { Component, OnInit } from '@angular/core';
import { CommonListComponent } from "../commonListComponent";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { takeUntil } from "rxjs";
import { RoleService } from "../../services/role/role.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { FiltroOrdini } from "../../models/FiltroOrdini";
import { PermissionApiService } from "../../services/permission/permission-api.service";
import { Ruolo } from "../../models/Ruolo";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['nome', 'azioni'];
  filtro: FiltroOrdini = new FiltroOrdini();
  expanded: any = null;

  allPermissions: any[] = [];
  selectedPermission: { [roleId: number]: any } = {};

  constructor(
    private service: RoleService,
    private permService: PermissionApiService,
    private route: Router,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadAllPermissions();
    this.retrieveList();
  }

  /* -------------------- PERMESSI -------------------- */

  loadAllPermissions() {
    this.permService.getAll().subscribe({
      next: perms => this.allPermissions = perms,
      error: err => console.error('Errore permessi:', err)
    });
  }

  toggleExpand(ruolo: any) {
    this.expanded = this.expanded === ruolo ? null : ruolo;
  }

  removePermission(ruolo: any, perm: any) {
    ruolo.permissions = ruolo.permissions.filter((p: any) => p.id !== perm.id);
  }

  addPermission(ruolo: any) {
    const p = this.selectedPermission[ruolo.id];
    if (!p) return;

    if (!ruolo.permissions.some((x: any) => x.id === p.id)) {
      ruolo.permissions.push(p);
    }

    this.selectedPermission[ruolo.id] = null;
  }

  savePermissions(ruolo: any) {
    const payload = {
      permissionIds: ruolo.permissions.map((p: any) => p.id),
    };

    this.service.updatePermissions(ruolo.id, payload).subscribe({
      next: () => console.log("Permessi aggiornati"),
      error: e => console.error(e)
    });
  }

  /* -------------------- CRUD RUOLI -------------------- */

  retrieveList(): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[]) => {
            this.createPaginator(data, 100);
            if (this.filtro.searchText) this.applyFilter();
            this.loader = false;
          },
          error: () => this.loader = false
        });
    }, 500);
  }

  creaNuovo() {
    const nuovo = new Ruolo();
    nuovo.edit = true;
    this.dataSource.data = [...this.dataSource.data, nuovo];
  }

  startEdit(ruolo: any) {
    ruolo._backup = { name: ruolo.name };
    ruolo.edit = true;
  }

  cancelEdit(ruolo: any) {
    if (ruolo._backup) {
      ruolo.name = ruolo._backup.name;
    }
    ruolo.edit = false;
  }

  saveRole(ruolo: any) {
    if (!ruolo.name || ruolo.name.trim() === '') return;

    if (ruolo.id) {
      this.service.update({ id: ruolo.id, name: ruolo.name }).subscribe(() => {
        ruolo.edit = false;
        this.retrieveList();
      });
    } else {
      this.service.save({ name: ruolo.name }).subscribe(() => {
        ruolo.edit = false;
        this.retrieveList();
      });
    }
  }

  /* -------------------- DELETE -------------------- */

  elimina(id: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: { msg: 'Sei sicuro di voler eliminare questo ruolo?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.elimina(id).subscribe(() => this.retrieveList());
      }
    });
  }

  /* -------------------- FILTRO -------------------- */

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean =>
      data.name.toLowerCase().includes(filter);
  }
}
