import { Component, OnInit } from '@angular/core';
import { PermissionService } from '../../../services/permission/permission.service';
import { Permission } from '../../../models/permission';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {

  permissions: Permission[] = [];
  loading: boolean = false;

  canManage: boolean = false;

  constructor(
    private permService: PermissionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.canManage = this.auth.hasPerm('permissions.manage');

    if (this.canManage) {
      this.loadPermissions();
    }
  }

  loadPermissions(): void {
    this.loading = true;

    this.permService.getAll()
      .subscribe({
        next: (res: Permission[]) => {
          this.permissions = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}
