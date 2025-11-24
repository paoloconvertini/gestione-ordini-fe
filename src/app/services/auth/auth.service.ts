import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = environment.TOKEN_KEY;

  private _user$ = new BehaviorSubject<any>(null);
  user$ = this._user$.asObservable();

  private logoutTimer: any = null;

  constructor(
    private http: HttpClient,
    private helper: JwtHelperService,
    private router: Router
  ) {
    this.restoreSession();
  }

  // -----------------------------------------------------------
  // LOGIN
  // -----------------------------------------------------------
  login(credentials: any) {
    return this.http.post<any>(environment.baseAuthUrl + environment.LOGIN, credentials)
      .subscribe(res => {
        if (!res.idToken) return;

        localStorage.setItem(this.tokenKey, res.idToken);
        this.decodeAndStore(res.idToken);
        this.router.navigate(['/ordini-clienti']);
      });
  }

  // -----------------------------------------------------------
  // LOGOUT
  // -----------------------------------------------------------
  logout() {
    localStorage.removeItem(this.tokenKey);

    this._user$.next(null);

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    this.router.navigate(['/login']);
  }

  // -----------------------------------------------------------
  // DECODE TOKEN + START AUTO-LOGOUT TIMER
  // -----------------------------------------------------------
  private decodeAndStore(token: string) {
    const decoded = this.helper.decodeToken(token);

    const user = {
      username: decoded.upn,
      roles: decoded.groups || [],
      permissions: decoded.permissions || [],
      exp: decoded.exp
    };

    this._user$.next(user);

    this.startAutoLogout(decoded.exp);
  }

  // -----------------------------------------------------------
  // AUTO-LOGOUT ALLA SCADENZA (CUORE DELLA FUNZIONALITÀ)
  // -----------------------------------------------------------
  private startAutoLogout(exp: number) {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const now = Date.now() / 1000;
    const secondsToExpire = exp - now;

    if (secondsToExpire <= 0) {
      this.logout();
      return;
    }

    this.logoutTimer = setTimeout(() => {
      console.log("Token expired → Auto logout");
      this.logout();
    }, secondsToExpire * 1000);
  }

  // -----------------------------------------------------------
  // RESTORE SESSION
  // -----------------------------------------------------------
  private restoreSession() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;

    if (this.helper.isTokenExpired(token)) {
      this.logout();
      return;
    }

    this.decodeAndStore(token);
  }

  // -----------------------------------------------------------
  // CHECK AUTORIZZAZIONI CENTRALI
  // -----------------------------------------------------------
  hasRole(role: string): boolean {
    const u = this._user$.value;
    return u?.roles?.includes(role);
  }

  hasPerm(perm: string): boolean {
    const u = this._user$.value;
    return u?.permissions?.includes(perm);
  }

  isLogged(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return token != null && !this.helper.isTokenExpired(token);
  }
}
