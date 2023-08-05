import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {RoleService} from "../../services/role/role.service";
import {takeUntil} from "rxjs";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {Ruolo} from "../../models/Ruolo";
import {FiltroOrdini} from "../../models/FiltroOrdini";

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['nome', 'azioni'];
  isAdmin: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();


  constructor(private service: RoleService, private route: Router, private dialog: MatDialog) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll().pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[]) => {
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
    this.dataSource.data.push(new Ruolo());
    this.dataSource.data = this.dataSource.data;
  }

  elimina(id: any) {
    this.openConfirmDialog(null, null, id);
  }

  openConfirmDialog(extraProp: any, preProp: any, data: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di voler eliminare questo ruolo. L\'azione è irreversibile.';
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

  salva(ruolo: any) {
    if(ruolo.id){
      this.service.update({id: ruolo.id, name: ruolo.name}).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res) => {
          if (!res.error) {
            this.retrieveList();
          }
        },
        error: (e) => console.error(e)
      });
    } else {
      this.service.save({name: ruolo.name}).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res) => {
          if (!res.error) {
            this.retrieveList();
          }
        },
        error: (e) => console.error(e)
      });
    }
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.name.toLowerCase().includes(filter)
      )
    }
  }
}
