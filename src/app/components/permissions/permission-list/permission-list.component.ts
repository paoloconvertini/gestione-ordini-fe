import { Component, OnInit, ViewChild } from '@angular/core';
import { PermissionApiService } from '../../../services/permission/permission-api.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.css']
})
export class PermissionListComponent implements OnInit {

  @ViewChild('drawer') drawer!: MatDrawer;

  permissions: any[] = [];
  newPermission = { name: '', description: '' };

  selectedPermission: any = null;

  displayedColumns = ['name', 'description', 'roles', 'actions'];

  constructor(
    private permApi: PermissionApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions() {
    this.permApi.getAll().subscribe((data: any) => {
      this.permissions = data;
    });
  }

  createPermission() {
    if (!this.newPermission.name.trim()) return;

    this.permApi.create(this.newPermission).subscribe(() => {
      this.newPermission = { name: '', description: '' };
      this.loadPermissions();
    });
  }

  updatePermission(p: any) {
    this.permApi.updatePermesso(p.id, { name: p.name, description: p.description })
      .subscribe(() => this.loadPermissions());
  }

  deletePermission(p: any) {
    this.permApi.getRolesOfPermission(p.id).subscribe((roles: any[]) => {

      const msg = roles.length > 0 ?
        `Il permesso è assegnato a ${roles.length} ruoli. Eliminare comunque?` :
        `Eliminare il permesso?`;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: { msg }
      });

      dialogRef.afterClosed().subscribe(ok => {
        if (ok) {
          this.permApi.delete(p.id).subscribe(() => this.loadPermissions());
        }
      });

    });
  }

  openRoleDrawer(p: any) {
    this.selectedPermission = p;
    this.drawer.open();
  }

}
