import {MatTableDataSource} from "@angular/material/table";
import {Directive, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {CommonService} from "../services/CommonSerivce";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment";

@Directive()
export abstract class CommonListComponent {
  loader = false;
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected constructor(protected service: CommonService, protected dialog: MatDialog, protected snackbar: MatSnackBar) {
  }

  retrieveList(status:any): void {
    this.loader = true;
    setTimeout( () => {this.service.getAll(status)
      .subscribe({
        next: (data: any[] | undefined) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
    }, 2000);
  }

  getById(id:any): void {
    this.loader = true;
    setTimeout( () => {this.service.get(id)
      .subscribe({
        next: (data: any[] | undefined) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
    }, 2000);
  }

  getArticoliByOrdineId(anno: any, serie: any, progressivo: any): void {
    this.loader = true;
    setTimeout( () => {this.service.getArticoliByOrdineId(anno, serie, progressivo)
      .subscribe({
        next: (data: any[] | undefined) => {
          data?.forEach(d => d.username = localStorage.getItem(environment.USERNAME));
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
    }, 2000);
  }

  upload(data: any): void {
    this.loader = true;
    this.service.upload(data).subscribe({
      next: (res) => {
        this.loader = false;
        if(res && !res.error) {
          console.log(res);
          this.snackbar.open('Ordine firmato. Puoi trovare il pdf nella cartella condivisa', 'Chiudi', {
            duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'})
        }
      },
      error: (e) => {
        console.error(e);
        this.loader = false;
      }
    });
  }

  updateArticoli(anno: any, serie: any, progressivo: any, data: any): void {
    this.service.update(data)
      .subscribe({
        next: (res) => {
          if(!res.error){
            this.getArticoliByOrdineId(anno, serie, progressivo);
          }
        },
        error: (e) => console.error(e)
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /*openDeleteDialog(model: any, extraProp: any, preProp: any) {
    let msg = '';
    if(preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di voler procedere con l\'eliminazione di ';
    msg += model.nome;
    if (extraProp) {
      msg += " ";
      msg += extraProp;
    }
    msg += '?';
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(model.id);
      }
    });
  }*/

}

