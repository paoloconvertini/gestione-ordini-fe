import {Component, Inject, OnInit} from '@angular/core';
import {takeUntil} from "rxjs";
import {ArticoloCliente} from "../../models/ArticoloCliente";
import {CommonListComponent} from "../commonListComponent";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ArticoloService} from "../../services/ordine-cliente/articolo/articolo.service";
import {FidoClienteComponent} from "../ordine-cliente/logistica/fido-cliente/fido-cliente.component";

interface DialogData {
  status: string;
  serie: string;
  progressivo: number;
  anno: number;
  intestazione: string;
}

@Component({
  selector: 'app-consegne-settimanali-dettaglio-dialog',
  templateUrl: './consegne-settimanali-dettaglio-dialog.component.html',
  styleUrls: ['./consegne-settimanali-dettaglio-dialog.component.css']
})
export class ConsegneSettimanaliDettaglioDialogComponent extends CommonListComponent implements OnInit {

  constructor(private dialog: MatDialog, private articoloService: ArticoloService,
              private dialogRef: MatDialogRef<ConsegneSettimanaliDettaglioDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    super();
  }

  articoli: ArticoloCliente[] = [];
  loaderDettaglio: boolean = false;


  getDettaglio() {
    this.loaderDettaglio = true;
    let bolla = 'N';
    if(!this.data.status) {
      bolla = '0';
    }
    this.articoloService.getArticoli(bolla, this.data.anno, this.data.serie, this.data.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: ArticoloCliente[]) => {
          if (data) {
            this.articoli = data;
          }
          this.loaderDettaglio = false;
        }
      })
  }

  ngOnInit(): void {
    this.getDettaglio();
  }

  chiudi() {
    this.dialogRef.close();
  }

  mostraNonDisponibile(articolo:any):number {
    if( articolo.tipoRigo !== '' && articolo.tipoRigo !== ' ') {
      return 2;
    } else if(articolo.flagNonDisponibile || (articolo.flagOrdinato && !articolo.flagRiservato)) {
      return 1;
    } else {
      return 0;
    }
  }

  apriFidoClienteModal(order: any) {
    this.dialog.open(FidoClienteComponent, {
      width: '60%',
      data: order.sottoConto
    });
  }

}
