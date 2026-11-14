import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {formatDate} from '@angular/common';
import {forkJoin, takeUntil} from 'rxjs';
import {BaseComponent} from '../baseComponent';
import {SaldiMagazzinoService} from '../../services/saldi-magazzino/saldi-magazzino.service';
import {RichiestaCaricoInfissi, RigaCaricoInfissi, RipartizioneCaricoInfissi} from '../../models/carico-infissi';
import {Dizionario} from '../../models/Dizionario';

@Component({
  selector: 'app-carico-infissi-dialog',
  templateUrl: './carico-infissi-dialog.component.html',
  styleUrls: ['./carico-infissi-dialog.component.css']
})
export class CaricoInfissiDialogComponent extends BaseComponent implements OnInit {
  form = this.fb.group({
    numDoc: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/\S/)]],
    dataOperazione: [new Date(), Validators.required],
    dataDocumento: [new Date(), Validators.required],
    causale: ['', Validators.required],
    vettore: ['', Validators.required],
    totaleImponibile: [null as number | null, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
  });
  vettori: Dizionario[] = [];
  causali: Dizionario[] = [];
  anteprima: RipartizioneCaricoInfissi | null = null;
  caricamento = true;
  calcolo = false;
  salvataggio = false;
  errore = '';
  private revisione = 0;

  constructor(private fb: FormBuilder, private service: SaldiMagazzinoService,
              private dialog: MatDialogRef<CaricoInfissiDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public articoli: RigaCaricoInfissi[]) { super(); }

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.revisione++; this.anteprima = null;
    });
    forkJoin({vettori: this.service.getVettori(), causali: this.service.getCausali()})
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: dati => { this.vettori = dati.vettori as Dizionario[]; this.causali = dati.causali as Dizionario[]; this.caricamento = false; },
        error: () => { this.caricamento = false; this.errore = 'Impossibile caricare vettori e causali. Chiudi e riprova.'; }
      });
  }

  private richiesta(): RichiestaCaricoInfissi {
    const v = this.form.getRawValue();
    return {articoli: this.articoli.map(r => ({progrGenerale: r.progrGenerale, quantita: r.quantita})),
      totaleImponibile: Number(v.totaleImponibile), numDoc: v.numDoc!.trim(),
      dataOperazione: formatDate(v.dataOperazione!, 'yyyy-MM-dd', 'en'),
      dataDocumento: formatDate(v.dataDocumento!, 'yyyy-MM-dd', 'en'), causale: v.causale!, vettore: v.vettore!};
  }

  calcola(): void {
    if (this.form.invalid || this.calcolo || this.salvataggio || this.caricamento) { this.form.markAllAsTouched(); return; }
    this.calcolo = true; this.errore = ''; this.anteprima = null;
    const revisione = this.revisione;
    this.service.anteprimaInfissi(this.richiesta()).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: res => { if (revisione === this.revisione) this.anteprima = res; this.calcolo = false; },
      error: err => { this.calcolo = false; this.errore = err.error?.message || 'Impossibile calcolare la ripartizione.'; }
    });
  }

  salva(): void {
    if (!this.anteprima || this.form.invalid || this.salvataggio || this.calcolo) return;
    this.salvataggio = true; this.errore = ''; this.dialog.disableClose = true;
    this.form.disable({emitEvent: false});
    this.service.caricaInfissi(this.richiesta()).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: res => {
        if (res.error) { this.ripristina(); this.errore = res.msg; }
        else this.dialog.close(res);
      },
      error: err => { this.ripristina(); this.errore = err.error?.message || 'Carico non confermato: verifica prima di riprovare.'; }
    });
  }

  private ripristina(): void {
    this.salvataggio = false; this.dialog.disableClose = false;
    this.form.enable({emitEvent: false}); this.anteprima = null;
  }

  chiudi(): void { if (!this.salvataggio) this.dialog.close(); }
}
