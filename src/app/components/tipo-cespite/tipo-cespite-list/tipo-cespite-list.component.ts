import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {CespiteService} from "../../../services/cespite/cespite.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../../environments/environment";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";
import {takeUntil} from "rxjs";
import {FiltroOrdini} from "../../../models/FiltroOrdini";

@Component({
  selector: 'app-tipo-cespite-list',
  templateUrl: './tipo-cespite-list.component.html',
  styleUrls: ['./tipo-cespite-list.component.css']
})
export class TipoCespiteListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['tipoCespite', 'descrizione', 'gruppoConto', 'sottoConto', 'azioni']
  isAdmin: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();
  origin: string = '';

  constructor(private service: TipocespiteService, private router: ActivatedRoute, private route: Router, private dialog: MatDialog) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => {
          if (params.param) {
            this.origin = params.param;
          }
        }
      );
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

  crea() {
    this.route.navigate(['/' + this.origin + '/tipo-cespiti-detail']);
  }

  detail(tipoCespite: any) {
    this.route.navigate(['/' + this.origin + '/tipo-cespiti-detail', tipoCespite.tipoCespite]);
  }
}
