import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OrdineFornitoreService} from "../../services/ordine-fornitore/list/ordine-fornitore.service";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../baseComponent";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AggiornaData} from "../../models/AggiornaData";

interface DialogData {
  pid: number;
}

@Component({
  selector: 'app-aggiorna-data-consegna-dialog',
  templateUrl: './aggiorna-data-consegna-dialog.component.html',
  styleUrls: ['./aggiorna-data-consegna-dialog.component.css']
})
export class AggiornaDataConsegnaDialogComponent extends BaseComponent implements OnInit{

  pid: any;
  loader: boolean = false;
  aggiornaDataDto: AggiornaData = new AggiornaData();
  constructor(private snackbar: MatSnackBar, private dialogRef: MatDialogRef<AggiornaDataConsegnaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData, private service: OrdineFornitoreService) {
    super();
  }

  ngOnInit(): void {
    this.pid = this.data.pid;
    if(this.pid){
      this.getDataConsegna(this.pid);
    }
  }


  private getDataConsegna(pid: any) {
    this.loader = true;
    this.service.getDataConsegna(pid).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res) {
            this.aggiornaDataDto = res;
          }
        }
      });
  }

   inserisciDataConsegna() {
    this.loader = true;
    this.service.inserisciDataConsegna(this.aggiornaDataDto).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res && !res.error) {
            this.snackbar.open("Data inserita con successo", 'Chiudi', {
              duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
            });
            this.dialogRef.close(true);
          }
        }
      });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
