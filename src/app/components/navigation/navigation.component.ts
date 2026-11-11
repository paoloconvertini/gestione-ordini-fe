import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntil } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { BaseComponent } from '../baseComponent';
import { AuthService } from '../../services/auth/auth.service';
import {PermissionService} from "../../services/auth/permission.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent extends BaseComponent {

  menuOpen = true;
  mobile = false;

  username = '';
  mainRole = '';
  avatarLetter = '';

  constructor(
    private auth: AuthService,
    public perm: PermissionService,
    breakpoints: BreakpointObserver,
    router: Router
  ) {
    super();
    breakpoints.observe('(max-width: 900px)').pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
      this.mobile = result.matches;
      this.menuOpen = !this.mobile && localStorage.getItem('navigation.collapsed') !== 'true';
    });
    router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (this.mobile && event instanceof NavigationEnd) this.menuOpen = false;
    });
    const user = this.auth.getCurrentUser();
    this.username = user?.username || '';
    this.mainRole = user?.roles?.[0] || '';
    this.avatarLetter = this.username.charAt(0).toUpperCase();
  }

  toggleMenu(): void {
    this.onMenuChanged(!this.menuOpen);
  }

  onMenuChanged(open: boolean): void {
    this.menuOpen = open;
    if (!this.mobile) localStorage.setItem('navigation.collapsed', String(!open));
  }

  logout() {
    this.auth.logout();
  }

}
