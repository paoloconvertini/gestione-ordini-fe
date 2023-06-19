import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {CommonListComponent} from "../commonListComponent";
import {EventoService} from "../../services/evento/evento.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {takeUntil} from "rxjs";


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
  constructor(private service: EventoService, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    super();
  }
  list: any;
  color: any;
  noResult: boolean = false;

  ngOnInit(): void {
    this.loader = true;
    this.service.getEvento(this.data.anno, this.data.serie, this.data.progressivo, this.data.rigo)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (data: any[] | undefined) => {
          this.loader = false;
          if(!data || data.length === 0) {
            this.noResult = true;
          }
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
              d.color = '#E02A45FF';
            }
            if (d.azione === 'ORDINATO') {
              d.color = '#555ac0';
            }
            if (d.azione === 'CONSEGNATO') {
              d.color = '#aff1b6';
            }
            if (d.azione === 'PRONTO_CONSEGNA') {
              d.color = '#057712';
            }
            if (d.azione === 'QTA_RISERVATA') {
              d.color = 'rgba(55,19,143,0.79)';
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


  chiudi() {

  }
}
