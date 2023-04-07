import {MatTableDataSource} from "@angular/material/table";
import {Directive, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {CommonService} from "../services/CommonSerivce";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {ConfirmDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {Router} from "@angular/router";

@Directive()
export abstract class CommonListComponent {
  loader = false;
  dataSource = new MatTableDataSource;
  articoli: any[] | undefined = [];
  filtroConsegnati: boolean = false;
  filtroDaRiservare: boolean = false;
  totale: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected constructor(protected service: CommonService, protected dialog: MatDialog, protected snackbar: MatSnackBar, protected route: Router) {
  }

  retrieveList(status: any, update: boolean): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll(status, update)
        .subscribe({
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

  retrieveFornitoreList(status: any, update: boolean): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAllOaf(status, update)
        .subscribe({
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

  private createPaginator(data: any[] | undefined) {
    this.dataSource = new MatTableDataSource(data);
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Elementi per pagina';
      this.paginator._intl.nextPageLabel = 'Prossima';
      this.paginator._intl.previousPageLabel = 'Precedente';
      this.paginator._intl.firstPageLabel = 'Prima';
      this.paginator._intl.lastPageLabel = 'Ultima';
      this.paginator.pageSize = 10;
      this.paginator.showFirstLastButtons = true;
      this.paginator.pageSizeOptions = [5, 10, 25, 50];
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length == 0 || pageSize == 0) {
          return `0 di ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex =
          startIndex < length
            ? Math.min(startIndex + pageSize, length)
            : startIndex + pageSize;

        return `${startIndex + 1} - ${endIndex} di ${length}`;
      }
    }
    this.dataSource.paginator = this.paginator;
  }

  getArticoliByOrdineId(anno: any, serie: any, progressivo: any, filtro: boolean, filtroConsegnati: boolean, filtroDaRiservare: boolean): void {
    this.filtroConsegnati = filtroConsegnati;
    this.loader = true;
    setTimeout(() => {
      this.service.getArticoliByOrdineId(anno, serie, progressivo, filtro)
        .subscribe({
          next: (data: any[] | undefined) => {
            this.articoli = data;
            this.createPaginator(data);
            if(filtroConsegnati) {
              this.filtraConsegnati();
            }
            if(filtroDaRiservare) {
              this.filtraDaRiservare();
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

  getOafArticoliByOrdineId(anno: any, serie: any, progressivo: any): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getOafArticoliByOrdineId(anno, serie, progressivo)
        .subscribe({
          next: (data: any[] | undefined) => {
            if(data) {
              data.forEach(d => {
                this.totale += d.oprezzo;
              })
              this.articoli = data;
              this.createPaginator(data);
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

  upload(data: any): Observable<any> {
    return this.service.upload(data);
  }

  approvaOrdine(anno: any, serie:any, progressivo: any): Observable<any> {
    return this.service.approvaOrdine(anno, serie, progressivo);
  }

  apriOrdine(anno: any, serie:any, progressivo: any, stato: string): Observable<any> {
    return this.service.apriOrdine(anno, serie, progressivo, stato);
  }

  updateArticoli(anno: any, serie: any, progressivo: any, data: any, filtro: boolean): void {
    this.loader = true;
    this.service.update(data)
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getArticoliByOrdineId(anno, serie, progressivo, filtro, false, false);
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  updateOafArticoli(anno: any, serie: any, progressivo: any, data: any): void {
    this.loader = true;
    this.service.update(data)
      .subscribe({
        next: (res) => {
          this.loader = false;
          if (!res.error) {
            this.getOafArticoliByOrdineId(anno, serie, progressivo, );
          }
        },
        error: (e) => {
          console.error(e);
          this.loader = false;
        }
      });
  }


  chiudi(data: any): Observable<any> {
    return this.service.chiudi(data);
  }

  richiediOafApprovazione(data: any): Observable<any> {
    if(data instanceof Array) {
      return this.service.richiediOafApprovazioneAll(data);
    } else {
      return this.service.richiediOafApprovazione(data.anno, data.serie, data.progressivo);
    }

  }

  richiediApprovazione(data:any) {
    this.openConfirmDialog(null, null, data);
  }

  openConfirmDialog(extraProp: any, preProp: any, data: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di aver processato correttamente tutti gli articoli';
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
        this.richiediOafApprovazione(data).subscribe({
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public filtraConsegnati() {
    if (this.filtroConsegnati) {
      this.createPaginator(this.articoli!.filter((el: any) => {
        return !el.geFlagConsegnato || el.geFlagConsegnato === false;
      }))
    } else {
      this.createPaginator(this.articoli);
    }
  }

  public filtraDaRiservare() {
    if (this.filtroDaRiservare) {
      this.createPaginator(this.articoli!.filter((el: any) => {
        return el.geFlagOrdinato === true;
      }))
    } else {
      this.createPaginator(this.articoli);
    }
  }

}

