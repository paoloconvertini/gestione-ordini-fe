import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../../environments/environment";
import {CespiteService} from "../../../services/cespite/cespite.service";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {TipocespiteDialogComponent} from "../../tipo-cespite/tipocespite-dialog/tipocespite-dialog.component";

@Component({
  selector: 'app-cespite',
  templateUrl: './cespite.component.html',
  styleUrls: ['./cespite.component.css']
})
export class CespiteComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['codice', 'progressivo', 'desc',
    /*'perc',*/
    'azioni'];
  isAdmin: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();

  constructor(private service: CespiteService, private route: Router, private dialog: MatDialog, private router: ActivatedRoute) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      if (params.param) {
        this.origin = params.param;
      }
    });
  }

  ngOnInit(): void {
    this.retrieveList();
  }

  cercaConto(cespite: any) {
    const dialogRef = this.dialog.open(TipocespiteDialogComponent, {
      width: '90%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        cespite.tipoCespite = result.tipoCespite;
      }
    });
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAllCespiti(this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[]) => {
          data.forEach(el => {
            el.venduto = !!el.dataVend;
          })
          this.createPaginator(data, 100);
          if (this.filtro.searchText) {
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
    if (cespite.id) {
      this.service.update({
        id: cespite.id,
        tipoCespite: cespite.tipoCespite
      }, this.origin).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: () => {
          this.retrieveList();
        },
        error: (e) => console.error(e)
      });
    }
  }

  elimina(id: any) {
    this.openConfirmDialog(null, null, id);
  }

  openConfirmDialog(extraProp: any, preProp: any, data: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di voler eliminare questo cespite? L\'azione è irreversibile.';
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
        this.service.elimina(data, this.origin).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
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
        data.tipoCespite.toLowerCase().includes(filter)
        || data.cespite.toLowerCase().includes(filter)
      )
    }
  }
}
