import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import {PermissionService} from "../../services/auth/permission.service";
import {OrdiniClientiStateService} from "../../services/state/ordini-clienti-state.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  username = '';
  mainRole = '';
  avatarLetter = '';

  constructor(
    private auth: AuthService,
    public perm: PermissionService
  ) {
    const user = this.auth.getCurrentUser();
    this.username = user?.username || '';
    this.mainRole = user?.roles?.[0] || '';
    this.avatarLetter = this.username.charAt(0).toUpperCase();
  }

  logout() {
    this.auth.logout();
  }

}
