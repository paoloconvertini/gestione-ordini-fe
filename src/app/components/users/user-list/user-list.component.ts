import { Component, OnInit } from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {environment} from "../../../../environments/environment";
import {UserService} from "../../../services/users/user.service";
import {takeUntil} from "rxjs";
import {Router} from "@angular/router";
import {Dipendente} from "../../../models/Dipendente";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['username', 'nome', 'cognome', 'azioni'];
  isAdmin: boolean = false;

  constructor(private service: UserService, private route: Router) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  modifica(dipendente: Dipendente) {
    this.route.navigate(['/users-detail', dipendente.id]);
  }

  retrieveList(): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll().pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[] | undefined) => {
            this.createPaginator(data);
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

}
