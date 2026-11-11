import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { PrezzoArticolo, StoricoPrezzoArticolo } from '../../models/prezzo-articolo';
import { PrezziArticoliService } from '../../services/prezzi-articoli/prezzi-articoli.service';

@Component({
  selector: 'app-storico-prezzi-dialog',
  templateUrl: './storico-prezzi-dialog.component.html',
  styleUrls: ['./storico-prezzi-dialog.component.css']
})
export class StoricoPrezziDialogComponent extends BaseComponent implements OnInit {
  storico: StoricoPrezzoArticolo[] = [];
  caricamento = true;
  errore = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: Pick<PrezzoArticolo, 'articolo' | 'descrizione'>,
              private service: PrezziArticoliService) {
    super();
  }

  ngOnInit(): void {
    this.service.storico(this.data.articolo).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: storico => {
        this.storico = storico;
        this.caricamento = false;
      },
      error: error => {
        this.caricamento = false;
        this.errore = error.error?.msg || 'Impossibile caricare la cronologia dei prezzi';
      }
    });
  }
}
