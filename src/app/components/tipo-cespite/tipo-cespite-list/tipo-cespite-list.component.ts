import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {CespiteService} from "../../../services/cespite/cespite.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../../environments/environment";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";
import {takeUntil} from "rxjs";
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {AuthService} from "../../../services/auth/auth.service";

@Component({
  selector: 'app-tipo-cespite-list',
  templateUrl: './tipo-cespite-list.component.html',
  styleUrls: ['./tipo-cespite-list.component.css']
})
export class TipoCespiteListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['tipoCespite', 'descrizione', 'gruppoConto', 'sottoConto', 'azioni']
  isAdmin: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();

  constructor(private service: TipocespiteService, private router: ActivatedRoute, private authService: AuthService,
              private route: Router, private dialog: MatDialog) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => {
          if (params.param) {
            this.origin = params.param;
          }
        }
      );
    if (this.authService.hasRole('Admin')) {
      this.isAdmin = true;
    }
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
      this.service.getAll(this.origin).pipe(takeUntil(this.ngUnsubscribe))
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
  }

  salva(cespite: any) {
    if(cespite.id){
      this.service.update({id: cespite.id, perc: cespite.ammortamento}, this.origin).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
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
        data.tipoCespite.toLowerCase().includes(filter)
        || data.descrizione.toLowerCase().includes(filter)
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
