import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {User} from "../../models/user";
import {LoginResponseI} from "../../models/login-response.interface";
import {Router} from "@angular/router";

const url = environment.baseAuthUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private http: HttpClient, private snackbar: MatSnackBar, private helper: JwtHelperService, private router: Router) {
    const token = localStorage.getItem(environment.TOKEN_KEY);
    this._isLoggedIn$.next(!!token);
  }

  getVenditori(data:any): Observable<any> {
    return this.http.post<any>(url + 'users/byRole', data);
  }

  updatePassword(username: string, data: any) : Observable<any> {
    return this.http.put<any>(url + `users/${username}`, data);
  }

  login(user: User): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>(url + environment.LOGIN, user).pipe(
      tap((res: LoginResponseI) => {
        if(!res.idToken) {
          console.log("ERRORE");
        }
        this._isLoggedIn$.next(true);
        localStorage.setItem(environment.TOKEN_KEY, res.idToken);
        if (user.username) {
          localStorage.setItem(environment.USERNAME, user.username);
        }
        let tokenObj = this.helper.decodeToken(res.idToken);
        user.ruolo = tokenObj.groups;

        if (user.ruolo!.includes('Magazziniere')) {
          localStorage.setItem(environment.MAGAZZINIERE, 'Y');
        }
        if (user.ruolo!.includes('Amministrativo')) {
          localStorage.setItem(environment.AMMINISTRATIVO, 'Y');
        }
        if (user.ruolo!.includes('Venditore')) {
          localStorage.setItem(environment.VENDITORE, 'Y');
        }
        if (user.ruolo!.includes('Admin')) {
          localStorage.setItem(environment.ADMIN, 'Y');
        }
        if (user.ruolo!.includes('Logistica')) {
          localStorage.setItem(environment.LOGISTICA, 'Y');
        }
      }),
      tap(() => this.snackbar.open('Login successfull', 'Chiudi', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      }))
    )
  }

  logout() {
    this._isLoggedIn$.next(false);
    localStorage.removeItem(environment.TOKEN_KEY);
    localStorage.removeItem(environment.USERNAME);
    localStorage.removeItem(environment.MAGAZZINIERE);
    localStorage.removeItem(environment.VENDITORE);
    localStorage.removeItem(environment.ADMIN);
    localStorage.removeItem(environment.AMMINISTRATIVO);
    localStorage.removeItem(environment.LOGISTICA);
    localStorage.removeItem('filtro');
    this.router.navigate(['']);
  }
}
