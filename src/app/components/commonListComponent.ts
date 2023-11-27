import {MatTableDataSource} from "@angular/material/table";
import {Directive, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {BaseComponent} from "./baseComponent";

@Directive()
export abstract class CommonListComponent extends BaseComponent{
  loader = false;
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  origin: string = '';

  protected constructor() {
    super();
  }

  protected createPaginator(data: any[] | undefined, pageSize: number) {
    this.dataSource = new MatTableDataSource(data);
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Elementi per pagina';
      this.paginator._intl.nextPageLabel = 'Prossima';
      this.paginator._intl.previousPageLabel = 'Precedente';
      this.paginator._intl.firstPageLabel = 'Prima';
      this.paginator._intl.lastPageLabel = 'Ultima';
      this.paginator.pageSize = pageSize;
      this.paginator.showFirstLastButtons = true;
      this.paginator.pageSizeOptions = [5, 10, 15, 25, 50, 100];
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

  applyFilter(filter:string) {
    this.dataSource.filter = filter.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

