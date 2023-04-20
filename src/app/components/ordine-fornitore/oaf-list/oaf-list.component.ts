import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {takeUntil} from "rxjs";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-oaf-list',
  templateUrl: './oaf-list.component.html',
  styleUrls: ['./oaf-list.component.css']
})
export class OafListComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'fornitore', 'data', 'azioni'];
  status?: string;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;

  constructor(private router: ActivatedRoute, private dialog: MatDialog, private service: OrdineFornitoreService, private route: Router) {
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
        } else {
          this.status = '';
        }
      this.retrieveFornitoreList(this.status, false);
      }
    );

  }

  retrieveFornitoreList(status: any, update: boolean): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAllOaf(status, update)
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
    this.retrieveFornitoreList(this.status, true);
  }

  apriDettaglio(ordine: OrdineCliente) {
    let url = "/oaf/articoli/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (this.status) {
      url += "/" + this.status;
    }
    this.route.navigateByUrl(url);
  }

  richiediApprovazione(ordine: OrdineCliente) {
    this.openConfirmDialog(ordine);
  }

  richiediApprovazioneAll(){
    this.openConfirmDialog(this.dataSource.filteredData);
  }

  public openConfirmDialog(data: any) {
    let msg =  'Sei sicuro di aver processato correttamente tutti gli articoli?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let observable;
        if(data instanceof Array) {
          observable = this.service.richiediOafApprovazioneAll(data);
        } else {
          observable = this.service.richiediOafApprovazione(data.anno, data.serie, data.progressivo);
        }
        observable.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              if (!res.error) {
                this.route.navigate(['/ordini-fornitore', 'DA_APPROVARE']);
              }
            },
            error: (e) => console.error(e)
          });
      }
    });
  }
}
