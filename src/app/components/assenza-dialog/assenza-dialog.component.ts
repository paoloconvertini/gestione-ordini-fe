import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { AssenzaService } from '../../services/assenza/assenza.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-assenza-dialog',
  templateUrl: './assenza-dialog.component.html',
  styleUrls: ['./assenza-dialog.component.css']
})
export class AssenzaDialogComponent extends BaseComponent implements OnInit {

  loader = false;
  saveAttempted = false;

  dto: any = {
    giornataIntera: true,
    codVenditori: []
  };

  venditori: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AssenzaDialogComponent>,
    private assenzaService: AssenzaService,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {

    this.loadVenditori();

    if (this.data?.id) {
      this.load();
    }
  }

  load(): void {

    this.loader = true;

    this.assenzaService.getById(this.data.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.dto = res;
          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  loadVenditori(): void {

    this.authService.getVenditori(['Venditore'])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.venditori = res;
      });
  }

  save(): void {

    this.saveAttempted = true;

    if (!this.isValid()) {
      return;
    }

    this.loader = true;

    const request = this.dto.id
      ? this.assenzaService.update(this.dto.id, this.dto)
      : this.assenzaService.create(this.dto);

    request
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loader = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.message || 'Errore durante il salvataggio');
          this.loader = false;
        }
      });
  }

  delete(): void {

    if (!confirm('Confermi eliminazione?')) {
      return;
    }

    this.loader = true;

    this.assenzaService.delete(this.dto.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loader = false;
          this.dialogRef.close(true);
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  isValid(): boolean {
    if (!this.dto.dataDa || !this.dto.dataA) {
      return false;
    }

    if (!this.dto.codVenditori?.length) {
      return false;
    }

    if (!this.dto.giornataIntera) {

      return !!(
        this.dto.oraDa &&
        this.dto.oraA
      );
    }

    return true;
  }
}
