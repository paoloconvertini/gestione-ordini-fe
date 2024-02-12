import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {FiltroPrimanota} from "../../models/FiltroPrimanota";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {takeUntil} from "rxjs";
import {PrimanotaService} from "../../services/primanota/primanota.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TipocespiteDialogComponent} from "../tipo-cespite/tipocespite-dialog/tipocespite-dialog.component";
import { CespiteDialogComponent } from '../cespite/cespite-dialog/cespite-dialog.component';

@Component({
  selector: 'app-primanota',
  templateUrl: './primanota.component.html',
  styleUrls: ['./primanota.component.css']
})
export class PrimanotaComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  filtro: FiltroPrimanota = new FiltroPrimanota();
  primanotaList: any[] = [];

  constructor(private service: PrimanotaService, private route: Router, private dialog: MatDialog, private snackbar: MatSnackBar, private router: ActivatedRoute) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    this.router.params.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: any) => {
          if (params.param) {
            this.origin = params.param;
          }
        }
      );
  }

  ngOnInit(): void {
  }

  retrieveList(): void {
    this.loader = true;
      this.service.getAll(this.filtro, this.origin).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: any[]) => {
            this.primanotaList = data;
            this.loader = false;
          },
          error: (e: any) => {
            console.error(e);
            this.loader = false;
          }
        })
  }

  reset() {
    this.filtro = new FiltroPrimanota();
  }

  salva(primanota: any) {
      this.service.save(primanota, this.origin).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
            primanota.edit = false;
          },
          error: (e: any) => {
            console.error(e);
          }
        })
  }

  cercaConto(primanota: any) {
    const dialogRef = this.dialog.open(TipocespiteDialogComponent, {
      width: '90%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        primanota.gruppoconto = result.costoGruppo;
        primanota.sottoconto = result.costoConto;
      }
    });
  }

  aggiungiRigo() {
    let primanota: any = {};
    primanota.progrprimanota = this.primanotaList.length + 1;
    primanota.importo = 0;
    primanota.gruppoconto = undefined;
    primanota.sottoconto = '';
    primanota.descrsuppl = '';
    primanota.datamovimento = this.primanotaList[0].datamovimento;
    primanota.numerodocumento = this.primanotaList[0].numerodocumento;
    primanota.giornale = this.primanotaList[0].giornale;
    primanota.anno = this.primanotaList[0].anno;
    primanota.protocollo = this.primanotaList[0].protocollo;
    this.primanotaList.push(primanota);
  }

  registraVendita() {
    const dialogRef = this.dialog.open(CespiteDialogComponent, {
      width: '90%',
      data: this.origin
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let data = {
          protocollo: this.primanotaList[0].protocollo,
          giornale: this.primanotaList[0].giornale,
          anno: this.primanotaList[0].anno,
          idCespite: result.id,
        }
        this.service.registraVendita(data, this.origin).pipe(takeUntil(this.ngUnsubscribe))
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
      }
    });
  }
}
