import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {FiltroPrimanota} from "../../models/FiltroPrimanota";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {takeUntil} from "rxjs";
import {PrimanotaService} from "../../services/primanota/primanota.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-primanota',
  templateUrl: './primanota.component.html',
  styleUrls: ['./primanota.component.css']
})
export class PrimanotaComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['dataDoc', 'numDoc', 'causale', 'gruppoconto',
    'sottoconto', 'descrsuppl', 'importo', 'azioni'];
  isAdmin: boolean = false;
  filtro: FiltroPrimanota = new FiltroPrimanota();

  constructor(private service: PrimanotaService, private route: Router, private dialog: MatDialog, private snackbar: MatSnackBar) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
  }

  ngOnInit(): void {
  }

  retrieveList(): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[]) => {
            this.createPaginator(data, 100);
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
    }, 2000);
  }

  reset() {
    this.filtro = new FiltroPrimanota();
  }

  salva(primanota: any) {
    setTimeout(() => {
      this.service.save(primanota).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
          },
          error: (e: any) => {
            console.error(e);
          }
        })
    }, 2000);
  }
}
