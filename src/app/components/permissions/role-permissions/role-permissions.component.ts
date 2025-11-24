import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../services/role/role.service';
import { PermissionService } from '../../../services/permission/permission.service';
import { Ruolo } from '../../../models/Ruolo';
import { Permission } from '../../../models/Permission';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.css']
})
export class RolePermissionsComponent implements OnInit {

  roles: Ruolo[] = [];
  permissions: Permission[] = [];
  selectedRoleId: number | null = null;
  checked: Set<number> = new Set();

  loading = false;

  constructor(
    private roleService: RoleService,
    private permService: PermissionService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.roleService.getAll().subscribe(res => this.roles = res);
  }

  loadPermissions() {
    this.permService.getAll().subscribe(res => this.permissions = res);
  }

  onRoleChange() {
    if (!this.selectedRoleId) return;

    this.checked.clear();
    this.roleService.getPermissions(this.selectedRoleId).subscribe(res => {
      res.forEach(p => this.checked.add(p.id));
    });
  }

  togglePermission(perm: Permission, event: any) {
    if (event.checked) this.checked.add(perm.id);
    else this.checked.delete(perm.id);
  }

  save() {
    if (!this.selectedRoleId) return;

    this.roleService.updatePermissions(this.selectedRoleId, {
      permissionIds: Array.from(this.checked)
    }).subscribe({
      next: () => this.snack.open("Permessi aggiornati", "OK", { duration: 2000 }),
      error: () => this.snack.open("Errore", "OK", { duration: 2000 })
    });
  }
}
