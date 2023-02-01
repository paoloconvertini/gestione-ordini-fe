import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {User} from "../../models/user";
import {LoginResponseI} from "../../models/login-response.interface";

const url = environment.baseAuthUrl + environment.LOGIN;
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  constructor(private http: HttpClient, private snackbar: MatSnackBar, private helper: JwtHelperService) {
    const token = localStorage.getItem('access_token');
    this._isLoggedIn$.next(!!token);
    this.userSubject = new BehaviorSubject<User>({});
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(user:User): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>(url, user).pipe(
      tap((res: LoginResponseI) => {
        this._isLoggedIn$.next(true);
        localStorage.setItem('access_token', res.idToken);
        let tokenObj = this.helper.decodeToken(res.idToken);
        user.ruolo = tokenObj.groups;
        this.userSubject.next(user);
      }),
      tap(()=> this.snackbar.open('Login successfull', 'Chiudi', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      }))
    )
  }
}
