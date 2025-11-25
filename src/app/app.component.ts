import { Component } from '@angular/core';
import { AuthService } from "./services/auth/auth.service";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'gestione-ordini';

  // indica se la route corrente è la pagina login
  isLoginPage: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {

    // ascolta i cambi di route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // true se stiamo in /login (o /login/qualcosa)
        this.isLoginPage = event.urlAfterRedirects.startsWith('/login');
      }
    });
  }
}
