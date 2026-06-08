import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { AssenzaService } from '../../services/assenza/assenza.service';
import { MatDialog } from '@angular/material/dialog';
import { AssenzaDialogComponent } from '../assenza-dialog/assenza-dialog.component';

@Component({
  selector: 'app-assenze-giorno-dialog',
  templateUrl: './assenze-giorno-dialog.component.html',
  styleUrls: ['./assenze-giorno-dialog.component.css']
})
export class AssenzeGiornoDialogComponent extends BaseComponent implements OnInit {

  loader = false;

  assenze: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AssenzeGiornoDialogComponent>,
    private assenzaService: AssenzaService, private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {

    this.loader = true;

    this.assenzaService.getByDate(this.data.data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any[]) => {
          this.assenze = res;
          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(id: number): void {

    const dialogRef = this.dialog.open(
      AssenzaDialogComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        data: { id: id }
      });

    dialogRef.afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.dialogRef.close(true);
      });
  }
}
