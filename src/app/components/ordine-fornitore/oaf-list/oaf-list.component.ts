import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {takeUntil} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SelectionModel} from "@angular/cdk/collections";
import {WarnDialogComponent} from "../../warn-dialog/warn-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-oaf-list',
  templateUrl: './oaf-list.component.html',
  styleUrls: ['./oaf-list.component.css']
})
export class OafListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['select', 'numero', 'fornitore', 'data', 'dataModifica',  'azioni'];
  status?: string;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  selection = new SelectionModel<any>(true, []);

  constructor(private snackbar: MatSnackBar, private router: ActivatedRoute, private dialog: MatDialog, private service: OrdineFornitoreService, private route: Router) {
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
  }


  ngOnInit(): void {
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
        if (params.status === 'DA_APPROVARE') {
          this.status = 'T';
        } else if (params.status === 'APPROVATO') {
          this.status = 'F';
        }
      this.retrieveFornitoreList(this.status);
      }
    );

  }

  unisciOrdini() {
    this.loader = true;
    this.service.unisciOrdini(this.selection.selected).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (res && !res.error) {
            this.retrieveFornitoreList(null);
          } else {
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: () => {
          this.snackbar.open('Errore!', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.loader = false;
        }
      })
  }

  retrieveFornitoreList(status: any): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAllOaf(status)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
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

  refreshPage() {
    this.retrieveFornitoreList(this.status);
  }

  apriDettaglio(ordine: OrdineCliente) {
    let url = "/oaf/articoli/" + ordine.anno
      + "/" + ordine.serie + "/" + ordine.progressivo;
    if(this.status) {
      url += "/" + this.status
    }
    this.route.navigateByUrl(url);
  }

}
