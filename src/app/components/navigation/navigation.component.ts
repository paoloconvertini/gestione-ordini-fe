import { Component } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {User} from "../../models/user";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent{

  constructor(private authService: AuthService) {
    this.user = this.authService.userValue;
  }

  user:User;

  logout(){
    this.authService.logout();
  }



}
