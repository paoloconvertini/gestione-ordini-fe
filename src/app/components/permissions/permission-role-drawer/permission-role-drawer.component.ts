import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RoleService } from '../../../services/role/role.service';

@Component({
  selector: 'app-permission-role-drawer',
  templateUrl: './permission-role-drawer.component.html',
  styleUrls: ['./permission-role-drawer.component.css']
})
export class PermissionRoleDrawerComponent implements OnChanges {

  @Input() permission: any;
  @Output() saved = new EventEmitter();

  roles: any[] = [];

  constructor(
    private roleApi: RoleService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.permission) {
      this.loadRoles();
    }
  }

  loadRoles() {
    this.roleApi.getAll().subscribe((roles: any[]) => {

      this.roles = roles.map(r => ({
        ...r,
        assigned: r.permissions?.some((p: any) => p.id === this.permission.id) || false
      }));

    });
  }

  save() {
    const ids = this.roles
      .filter(r => r.assigned)
      .map(r => r.id);

    // chiama backend
    // PUT /api/roles/{id}/permissions
    const payload = { permissionIds: ids };

    // !!! IMPORTANTE: usare RoleService.updatePermissions
    // Se non ce l’hai te lo creo:

    this.roleApi.updatePermissions(this.permission.id, payload)
      .subscribe(() => this.saved.emit(true));
  }
}
