import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {takeUntil} from "rxjs";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../../environments/environment";
import {CespiteService} from "../../../services/cespite/cespite.service";

@Component({
  selector: 'app-cespite',
  templateUrl: './cespite.component.html',
  styleUrls: ['./cespite.component.css']
})
export class CespiteComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['codice', 'progressivo', 'desc', 'perc', 'azioni'];
  isAdmin: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();

  constructor(private service: CespiteService, private route: Router, private dialog: MatDialog) {
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
      this.service.getAllCespiti().pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[]) => {
            data.forEach(el => {
              el.venduto = !!el.dataVend;
            })
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

  salva(cespite: any) {
    if(cespite.id){
      this.service.update({id: cespite.id, perc: cespite.ammortamento}).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: () => {
          cespite.edit = false;
        },
        error: (e) => console.error(e)
      });
    }
  }

  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.cespite.toLowerCase().includes(filter)
      )
    }
  }
}
