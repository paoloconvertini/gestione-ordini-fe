import { Component, OnInit } from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {environment} from "../../../../environments/environment";
import {UserService} from "../../../services/users/user.service";
import {takeUntil} from "rxjs";
import {Router} from "@angular/router";
import {Dipendente} from "../../../models/Dipendente";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {FiltroOrdini} from "../../../models/FiltroOrdini";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['username', 'nome', 'cognome', 'azioni'];
  isAdmin: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();


  constructor(private service: UserService, private route: Router, private dialog: MatDialog) {
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
            this.createPaginator(data, 100);
            if(this.filtro.searchText){
              this.applyFilter();
            }
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

  creaNuovo() {
    this.route.navigate(['/users-detail']);
  }

  elimina(dipendente: Dipendente) {
    this.openConfirmDialog(null, null, dipendente.id);
  }

  openConfirmDialog(extraProp: any, preProp: any, data: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di voler eliminare questo dipendente. L\'azione è irreversibile.';
    if (extraProp) {
      msg += " ";
      msg += extraProp;
    }
    msg += '?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.elimina(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (res) => {
            if (!res.error) {
              this.retrieveList();
            }
          },
          error: (e) => console.error(e)
        });
      }
    });
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.username.toLowerCase().includes(filter)
        || data.name.toLowerCase().includes(filter)
        || data.lastname.includes(filter)
      )
    }
  }
}
