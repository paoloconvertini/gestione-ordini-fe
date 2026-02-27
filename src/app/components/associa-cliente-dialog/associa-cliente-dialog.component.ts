import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ShowroomService } from '../../services/showroom/showroom.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-associa-cliente-dialog',
  templateUrl: './associa-cliente-dialog.component.html',
  styleUrls: ['./associa-cliente-dialog.component.css']
})
export class AssociaClienteDialogComponent implements OnInit {

  search$ = new Subject<string>();
  searchText: string = '';
  clienti: any[] = [];
  selectedCliente: any = null;
  loader = false;

  constructor(
    private service: ShowroomService,
    private dialogRef: MatDialogRef<AssociaClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public visitaId: number
  ) {}

  ngOnInit(): void {

    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.service.searchClienti(q))
    ).subscribe(res => {
      this.clienti = res;
    });
  }

  onSearch(value: string) {
    if (!value || value.length < 3) {
      this.clienti = [];
      return;
    }
    this.search$.next(value);
  }

  selectCliente(c: any) {
    this.selectedCliente = c;
  }

  save() {

    if (!this.selectedCliente) return;

    this.loader = true;

    this.service.associaCliente(
      this.visitaId,
      this.selectedCliente.codiceCliente
    ).subscribe({
      next: () => {
        this.loader = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.loader = false;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
