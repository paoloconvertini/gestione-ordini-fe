import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs';
import { CommonListComponent } from '../commonListComponent';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AggiornamentoPrezzi, PrezzoArticolo } from '../../models/prezzo-articolo';
import { PrezziArticoliService } from '../../services/prezzi-articoli/prezzi-articoli.service';
import { PermissionService } from '../../services/auth/permission.service';
import { SelectionModel } from '@angular/cdk/collections';
import { RicaricoDeselezionatiDialogComponent, RicaricoDeselezionatiResult } from './ricarico-deselezionati-dialog.component';

@Component({
  selector: 'app-prezzi-articoli',
  templateUrl: './prezzi-articoli.component.html',
  styleUrls: ['./prezzi-articoli.component.css']
})
export class PrezziArticoliComponent extends CommonListComponent implements OnInit {
  classiFornitore: { codice: string; descrizione: string }[] = [];
  caricamentoClassi = false;
  classeA1 = '';
  percentuale: number | null = null;
  ricaricoImpostato: number | null = null;
  sogliaDaSalvare: number | null = null;
  includiBloccati = false;
  classeA1Caricato = '';
  percentualeAnteprima: number | null = null;
  bloccatiCaricati = false;
  ricercaEseguita = false;
  confermaAperta = false;
  portaASoglia = false;
  articoli: PrezzoArticolo[] = [];
  selection = new SelectionModel<PrezzoArticolo>(true, []);
  errore = '';
  colonne = ['selezione', 'articolo', 'costoUltimo', 'prezzoBase', 'ricaricoAttuale', 'deltaRicarico', 'nuovoPrezzo'];

  constructor(private service: PrezziArticoliService, private dialog: MatDialog,
              private snackbar: MatSnackBar, public perm: PermissionService) {
    super();
  }

  ngOnInit(): void {
    if (!this.perm.canGestisciPrezziArticoli) return;
    this.caricamentoClassi = true;
    this.service.classiFornitore().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: classi => {
        this.classiFornitore = classi.map(c => ({ codice: c.codice.trim(), descrizione: c.descrizione }))
          .sort((a, b) => a.descrizione.localeCompare(b.descrizione));
        this.caricamentoClassi = false;
      },
      error: () => {
        this.caricamentoClassi = false;
        this.errore = 'Impossibile caricare le classificazioni fornitore';
      }
    });
  }

  get classiFornitoreFiltrate(): { codice: string; descrizione: string }[] {
    const ricerca = this.classeA1.trim().toLocaleLowerCase();
    return this.classiFornitore.filter(c => `${c.codice} ${c.descrizione}`.toLocaleLowerCase().includes(ricerca));
  }

  mostraFornitore = (codice: string): string => {
    const fornitore = this.classiFornitore.find(c => c.codice === codice);
    return fornitore ? `${fornitore.codice} — ${fornitore.descrizione}` : codice || '';
  };

  get nomeFornitoreCaricato(): string {
    return this.classiFornitore.find(c => c.codice === this.classeA1Caricato)?.descrizione || this.classeA1Caricato;
  }

  annullaAnteprima(): void {
    if (this.loader || this.confermaAperta) return;
    this.percentualeAnteprima = null;
    this.portaASoglia = false;
    this.selection.clear();
    this.createPaginator(this.articoli, 50);
  }

  get classeA1Valido(): boolean {
    return this.classiFornitore.some(c => c.codice === this.classeA1.trim());
  }

  get sogliaVisibile(): number | null {
    return this.classeA1.trim() === this.classeA1Caricato ? this.ricaricoImpostato : null;
  }

  deltaRicarico(articolo: PrezzoArticolo): number | null {
    if (this.sogliaVisibile === null || articolo.ricaricoAttuale === null) return null;
    const delta = articolo.ricaricoAttuale - this.sogliaVisibile;
    const arrotondato = Math.round(Math.abs(delta));
    return arrotondato === 0 ? 0 : Math.sign(delta) * arrotondato;
  }

  get conteggiSoglia(): { sotto: number; sopra: number; pari: number; nonConfrontabili: number } | null {
    if (this.sogliaVisibile === null) return null;
    const conteggi = { sotto: 0, sopra: 0, pari: 0, nonConfrontabili: 0 };
    for (const articolo of this.articoli) {
      const delta = this.deltaRicarico(articolo);
      if (delta === null) conteggi.nonConfrontabili++;
      else if (delta < 0) conteggi.sotto++;
      else if (delta > 0) conteggi.sopra++;
      else conteggi.pari++;
    }
    return conteggi;
  }

  get percentualeValida(): boolean {
    return this.percentuale !== null && Number.isFinite(this.percentuale)
      && this.percentuale >= 0 && this.percentuale <= 10000
      && Math.abs(this.percentuale * 10000 - Math.round(this.percentuale * 10000)) < 0.00001;
  }

  get puoSalvareSoglia(): boolean {
    return this.perm.canGestisciPrezziArticoli && !this.loader && !this.confermaAperta
      && this.ricercaEseguita && this.classeA1Valido && this.classeA1.trim() === this.classeA1Caricato
      && this.sogliaDaSalvare !== null && Number.isFinite(this.sogliaDaSalvare)
      && this.sogliaDaSalvare >= 0 && this.sogliaDaSalvare <= 10000
      && Math.abs(this.sogliaDaSalvare * 10000 - Math.round(this.sogliaDaSalvare * 10000)) < 0.00001
      && this.sogliaDaSalvare !== this.ricaricoImpostato;
  }

  salvaSoglia(): void {
    if (!this.puoSalvareSoglia || this.sogliaDaSalvare === null) return;
    const percentuale = this.sogliaDaSalvare;
    this.loader = true;
    this.errore = '';
    this.service.salvaSoglia(this.classeA1Caricato, percentuale, this.ricaricoImpostato)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: response => {
          this.ricaricoImpostato = percentuale;
          this.sogliaDaSalvare = percentuale;
          this.loader = false;
          this.snackbar.open(response.msg, 'Chiudi', { duration: 5000 });
        },
        error: error => {
          this.loader = false;
          this.percentualeAnteprima = null;
          this.errore = error.error?.msg || 'Impossibile salvare la soglia. Ripetere la ricerca prima di riprovare.';
        }
      });
  }

  get aggiornabili(): PrezzoArticolo[] {
    return this.articoli.filter(a => a.aggiornabile);
  }

  get selezionabili(): PrezzoArticolo[] {
    return this.portaASoglia ? this.aggiornabili.filter(a => (this.deltaRicarico(a) ?? 0) < 0) : this.aggiornabili;
  }

  get puoPortareASoglia(): boolean {
    return this.perm.canGestisciPrezziArticoli && !this.loader && !this.confermaAperta
      && this.sogliaVisibile !== null && this.includiBloccati === this.bloccatiCaricati
      && this.aggiornabili.some(a => (this.deltaRicarico(a) ?? 0) < 0);
  }

  preparaPortaASoglia(): void {
    if (!this.puoPortareASoglia) return;
    this.percentuale = this.sogliaVisibile;
    this.cerca(true, true);
  }

  get puoSelezionare(): boolean {
    return this.perm.canGestisciPrezziArticoli && !this.loader && !this.confermaAperta
      && this.classeA1Valido && this.percentualeValida
      && this.classeA1.trim() === this.classeA1Caricato
      && this.includiBloccati === this.bloccatiCaricati
      && this.percentuale === this.percentualeAnteprima && this.percentualeAnteprima !== null
      && (!this.portaASoglia || this.percentuale === this.sogliaVisibile);
  }

  get selezionati(): PrezzoArticolo[] {
    return this.selezionabili.filter(a => this.selection.isSelected(a));
  }

  get puoApplicare(): boolean {
    return this.puoSelezionare && this.selezionati.length > 0;
  }

  selezionaTutti(): void {
    if (!this.puoSelezionare) return;
    if (this.selezionati.length === this.selezionabili.length) {
      this.selection.clear();
    } else {
      this.selection.select(...this.selezionabili);
    }
  }

  selezionaArticolo(articolo: PrezzoArticolo): void {
    if (this.puoSelezionare && this.selezionabili.includes(articolo)) this.selection.toggle(articolo);
  }

  cerca(anteprima = false, portaASoglia = false): void {
    if (!this.perm.canGestisciPrezziArticoli || !this.classeA1Valido || this.loader || this.confermaAperta
        || (anteprima && !this.percentualeValida)) return;
    const classeA1 = this.classeA1.trim();
    const percentuale = anteprima ? this.percentuale : null;
    const includiBloccati = this.includiBloccati;
    this.loader = true;
    this.portaASoglia = portaASoglia;
    this.errore = '';
    this.percentualeAnteprima = null;
    this.ricaricoImpostato = null;
    this.selection.clear();
    this.service.cerca(classeA1, percentuale, includiBloccati).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: data => {
        this.articoli = data.articoli;
        this.ricaricoImpostato = data.ricaricoImpostato;
        this.sogliaDaSalvare = data.ricaricoImpostato;
        this.classeA1Caricato = classeA1;
        this.bloccatiCaricati = includiBloccati;
        this.percentualeAnteprima = percentuale;
        this.ricercaEseguita = true;
        if (percentuale !== null) this.selection.select(...this.selezionabili);
        this.createPaginator(this.portaASoglia ? this.selezionabili : data.articoli, 50);
        if (this.portaASoglia && percentuale !== this.ricaricoImpostato) {
          this.percentualeAnteprima = null;
          this.errore = 'La soglia è cambiata. Premi nuovamente Porta a soglia per ricalcolare.';
        }
        this.loader = false;
      },
      error: error => {
        this.loader = false;
        this.errore = error.error?.msg || 'Impossibile caricare i prezzi degli articoli';
      }
    });
  }

  applica(): void {
    if (!this.puoApplicare || this.percentuale === null) return;
    const richiesta: AggiornamentoPrezzi = {
      classeA1: this.classeA1Caricato,
      percentuale: this.percentuale,
      ricaricoImpostato: this.ricaricoImpostato,
      includiBloccati: this.bloccatiCaricati,
      articoli: this.selezionati.map(a => ({ ...a }))
    };
    if (this.portaASoglia) richiesta.portaASoglia = true;
    const deselezionati = this.aggiornabili.filter(a => !this.selection.isSelected(a)).map(a => ({ ...a }));
    this.confermaAperta = true;
    if (deselezionati.length && !this.portaASoglia) {
      this.dialog.open<RicaricoDeselezionatiDialogComponent, unknown, RicaricoDeselezionatiResult>(RicaricoDeselezionatiDialogComponent, {
        width: '850px', maxWidth: '95vw', disableClose: true,
        data: { articoli: deselezionati, percentualePrincipale: richiesta.percentuale, numeroSelezionati: richiesta.articoli.length }
      }).afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(risultato => {
        this.confermaAperta = false;
        if (!risultato) return;
        if (risultato.applica) {
          if (risultato.percentuale === undefined) return;
          richiesta.percentualeDeselezionati = risultato.percentuale;
          richiesta.articoliDeselezionati = deselezionati;
        }
        this.inviaAggiornamento(richiesta);
      });
      return;
    }
    this.dialog.open(ConfirmDialogComponent, {
      width: '480px',
      data: { msg: this.portaASoglia
        ? `Portare alla soglia salvata del ${richiesta.percentuale}% i ${richiesta.articoli.length} articoli sotto soglia selezionati? Gli altri prezzi e la soglia resteranno invariati.`
        : `Applicare il ricarico del ${richiesta.percentuale}% sul costo ultimo a ${richiesta.articoli.length} articoli selezionati della classificazione fornitore ${richiesta.classeA1}? Il prezzo base sarà arrotondato a 3 decimali, senza aggiunta IVA. Saranno aggiornati solo gli articoli selezionati, anche nelle altre pagine.` }
    }).afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(conferma => {
      this.confermaAperta = false;
      if (!conferma) return;
      this.inviaAggiornamento(richiesta);
    });
  }

  private inviaAggiornamento(richiesta: AggiornamentoPrezzi): void {
    this.loader = true;
    this.errore = '';
    this.service.aggiorna(richiesta).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: response => {
        this.loader = false;
        this.snackbar.open(response.msg, 'Chiudi', { duration: 5000 });
        this.cerca(!richiesta.portaASoglia);
      },
      error: error => {
        this.loader = false;
        this.percentualeAnteprima = null;
        this.errore = error.error?.msg || 'Aggiornamento non completato. Ripetere la ricerca prima di riprovare.';
      }
    });
  }
}
