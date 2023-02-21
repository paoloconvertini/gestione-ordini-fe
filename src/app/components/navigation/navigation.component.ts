import { Component } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent{

  constructor(private authService: AuthService) {
    this.username = localStorage.getItem(environment.USERNAME);
  }

  username:string | null;

  logout(){
    this.authService.logout();
  }



}
