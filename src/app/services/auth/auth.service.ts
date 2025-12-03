import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import {OrdiniClientiStateService} from "../state/ordini-clienti-state.service";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey: string = environment.TOKEN_KEY;

  private _user$ = new BehaviorSubject<any>(null);
  user$ = this._user$.asObservable();

  isLoggedIn$ = this.user$.pipe(
    map(user => user !== null)
  );

  getCurrentUser() {
    return this._user$.value;
  }

  private logoutTimer: any = null;

  constructor(
    private http: HttpClient,
    private helper: JwtHelperService,
    private router: Router,
    private ordineState: OrdiniClientiStateService
  ) {
    this.restoreSession();
  }

  login(credentials: any): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(environment.baseAuthUrl + environment.LOGIN, credentials)
        .subscribe({
          next: (res: any) => {
            if (!res || !res.idToken) {
              observer.error('Token non presente');
              return;
            }

            localStorage.setItem(this.tokenKey, res.idToken);
            this.decodeAndStore(res.idToken);

            observer.next(res);
            observer.complete();
          },
          error: (err: any) => {
            observer.error(err);
          }
        });
    });
  }

  // -----------------------------------------------------------
  // UPDATE PASSWORD
  // -----------------------------------------------------------
  updatePassword(username: string, payload: { password: string }): Observable<any> {
    return this.http.put<any>(
      environment.baseAuthUrl + 'users/password/' + username,
      payload
    );
  }

  // -----------------------------------------------------------
  // GET VENDITORI (SERVE IN DIVERSE PAGINE)
  // -----------------------------------------------------------
  getVenditori(data: any): Observable<any> {
    return this.http.post<any>(environment.baseAuthUrl + 'users/byRole', data);
  }

  // -----------------------------------------------------------
  // LOGOUT
  // -----------------------------------------------------------
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._user$.next(null);

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    this.ordineState.clearOnLogout();
    this.router.navigate(['/login']);
  }

  // -----------------------------------------------------------
  // DECODE TOKEN + AUTO LOGOUT TIMER
  // -----------------------------------------------------------
  private decodeAndStore(token: string): void {
    const decoded: any = this.helper.decodeToken(token);

    const user = {
      username: decoded.upn,
      roles: decoded.groups || [],
      permissions: decoded.permissions || [],
      exp: decoded.exp
    };

    this._user$.next(user);

    this.startAutoLogout(decoded.exp);
  }

  private startAutoLogout(exp: number): void {
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
      console.log('Token expired → Auto logout');
      this.logout();
    }, secondsToExpire * 1000);
  }

  // -----------------------------------------------------------
  // RESTORE SESSION (AL REFRESH)
  // -----------------------------------------------------------
  private restoreSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;

    if (this.helper.isTokenExpired(token)) {
      this.logout();
      return;
    }

    this.decodeAndStore(token);
  }

  // -----------------------------------------------------------
  // CHECK PERMESSI / RUOLI
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
