import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../services/email/email.service";
import {OrdineClienteService} from "../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {environment} from "../../../environments/environment";
import {CespiteService} from "../../services/cespite/cespite.service";

@Component({
  selector: 'app-cespite',
  templateUrl: './cespite.component.html',
  styleUrls: ['./cespite.component.css']
})
export class CespiteComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  cespiteList: any;

  constructor(private authService: AuthService, private router: ActivatedRoute, private service: CespiteService, private dialog: MatDialog, private snackbar: MatSnackBar) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    if (localStorage.getItem(environment.MAGAZZINIERE)) {
      this.isMagazziniere = true;
    }
    if (localStorage.getItem(environment.AMMINISTRATIVO)) {
      this.isAmministrativo = true;
    }
    if (localStorage.getItem(environment.VENDITORE)) {
      this.isVenditore = true;
    }
    if (localStorage.getItem(environment.LOGISTICA)) {
      this.isLogistica = true;
    }
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          //this.createPaginator(data, 100);
          this.cespiteList = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

}
