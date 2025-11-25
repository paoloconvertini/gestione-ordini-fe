import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../../services/role/role.service';
import { PermissionService } from '../../../services/permission/permission.service';
import { Ruolo } from '../../../models/Ruolo';
import { Permission } from '../../../models/permission';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.css']
})
export class RolePermissionsComponent implements OnInit {

  roles: Ruolo[] = [];
  permissions: Permission[] = [];
  selectedRoleId: number | null = null;

  checked: Set<number> = new Set<number>();
  loading: boolean = false;

  canManage: boolean = false;

  constructor(
    private roleService: RoleService,
    private permService: PermissionService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Check permission before loading the page
    this.canManage = this.auth.hasPerm('permissions.manage');

    if (!this.canManage) return;

    this.loadRoles();
    this.loadPermissions();
  }

  // ---------------------------------------------------------
  // Load roles
  // ---------------------------------------------------------
  loadRoles(): void {
    this.roleService.getAll().subscribe((res: Ruolo[]) => {
      this.roles = res;
    });
  }

  // ---------------------------------------------------------
  // Load permissions
  // ---------------------------------------------------------
  loadPermissions(): void {
    this.permService.getAll().subscribe((res: Permission[]) => {
      this.permissions = res;
    });
  }

  // ---------------------------------------------------------
  // Role selected → load assigned permissions
  // ---------------------------------------------------------
  onRoleChange(): void {
    if (!this.selectedRoleId) return;

    this.checked.clear();

    this.permService.getRolePermissions(this.selectedRoleId)
      .subscribe((res: Permission[]) => {
        res.forEach((p: Permission) => this.checked.add(p.id));
      });
  }

  // ---------------------------------------------------------
  // Toggle permission checkbox
  // ---------------------------------------------------------
  togglePermission(perm: Permission, event: any): void {
    if (event.checked) this.checked.add(perm.id);
    else this.checked.delete(perm.id);
  }

  // ---------------------------------------------------------
  // Save permissions assigned to role
  // ---------------------------------------------------------
  save(): void {
    if (!this.selectedRoleId) return;

    const payload = {
      permissionIds: Array.from(this.checked)
    };

    this.permService.updateRolePermissions(this.selectedRoleId, payload)
      .subscribe({
        next: () => {
          this.snackBar.open("Permessi aggiornati", "OK", { duration: 2000 });
        },
        error: () => {
          this.snackBar.open("Errore nel salvataggio", "OK", { duration: 2000 });
        }
      });
  }
}
