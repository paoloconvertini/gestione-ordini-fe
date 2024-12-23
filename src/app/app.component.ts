import { Component } from '@angular/core';
import {AuthService} from "./services/auth/auth.service";
import {Router, Scroll} from "@angular/router";
import {ViewportScroller} from "@angular/common";
import {filter} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gestione-ordini';
  constructor(public authService: AuthService) {}
}
