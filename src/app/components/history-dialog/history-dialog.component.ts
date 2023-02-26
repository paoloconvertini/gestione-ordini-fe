import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../commonListComponent";
import {EventoService} from "../../services/evento/evento.service";
import {MatSnackBar} from "@angular/material/snack-bar";


export interface DialogData {
  anno: number;
  serie: string;
  progressivo: number;
  rigo: number;
}

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html',
  styleUrls: ['./history-dialog.component.css']
})
export class HistoryDialogComponent extends CommonListComponent implements OnInit{
  constructor( registroService: EventoService, dialog: MatDialog, snackbar: MatSnackBar,
  @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ){
    super(registroService, dialog, snackbar);
  }
  list: any;
  color: any;

  ngOnInit(): void {
    this.loader = true;
    this.service.getEvento(this.data.anno, this.data.serie, this.data.progressivo, this.data.rigo)
      .subscribe({
        next: (data: any[] | undefined) => {
          this.loader = false;
          data?.forEach(d => {
            if (d.azione === 'TONO') {
              d.color = '#9251ac';
            }
            if (d.azione === 'QUANTITA') {
              d.color = '#f6a4ec';
            }
            if (d.azione === 'RISERVATO') {
              d.color = '#87bbfe';
            }
            if (d.azione === 'NON_DISPONIBILE') {
              d.color = '#555ac0';
            }
            if (d.azione === 'CONSEGNATO') {
              d.color = '#aff1b6';
            }
          })
          this.list = data;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      });
  }


}
