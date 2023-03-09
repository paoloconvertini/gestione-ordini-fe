import {MatTableDataSource} from "@angular/material/table";
import {Directive, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {CommonService} from "../services/CommonSerivce";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Directive()
export abstract class CommonListComponent {
  loader = false;
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected constructor(protected service: CommonService, protected dialog: MatDialog, protected snackbar: MatSnackBar) {
  }

  retrieveList(status: any): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getAll(status)
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

  getArticoliByOrdineId(anno: any, serie: any, progressivo: any, filtro: boolean): void {
    this.loader = true;
    setTimeout(() => {
      this.service.getArticoliByOrdineId(anno, serie, progressivo, filtro)
        .subscribe({
          next: (data: any[] | undefined) => {
            data?.forEach(d => d.username = localStorage.getItem(environment.USERNAME));
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

  upload(data: any): Observable<any> {
    return this.service.upload(data);
  }

  updateArticoli(anno: any, serie: any, progressivo: any, data: any, filtro: boolean): void {
    this.service.update(data)
      .subscribe({
        next: (res) => {
          if (!res.error) {
            this.getArticoliByOrdineId(anno, serie, progressivo, filtro);
          }
        },
        error: (e) => console.error(e)
      });
  }

  chiudi(data: any): Observable<any> {
    return this.service.chiudi(data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

