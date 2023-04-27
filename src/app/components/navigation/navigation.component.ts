import { Component } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent{

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;

  constructor(private authService: AuthService) {
    this.username = localStorage.getItem(environment.USERNAME);
    if(localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    if(localStorage.getItem(environment.MAGAZZINIERE)) {
      this.isMagazziniere = true;
    }
    if(localStorage.getItem(environment.AMMINISTRATIVO)) {
      this.isAmministrativo = true;
    }
    if(localStorage.getItem(environment.VENDITORE)) {
      this.isVenditore = true;
    }
    if(localStorage.getItem(environment.LOGISTICA)){
      this.isLogistica = true;
    }
  }

  username:string | null;

  logout(){
    this.authService.logout();
  }



}
