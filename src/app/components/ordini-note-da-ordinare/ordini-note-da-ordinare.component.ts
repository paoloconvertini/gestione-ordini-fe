import {DASHBOARD_VIEWS, filtroDashboard} from '../../models/dashboard-view';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {takeUntil} from 'rxjs';
import {BaseComponent} from '../baseComponent';
import {DashboardService, OrdineNotaDaOrdinare} from '../../services/dashboard/dashboard.service';
import {AuthService} from '../../services/auth/auth.service';
import {PermissionService} from '../../services/auth/permission.service';
import {OrdiniClientiStateService} from '../../services/state/ordini-clienti-state.service';

interface GruppoOrdine { chiave: string; righe: OrdineNotaDaOrdinare[]; }
interface GruppoVenditore { codice: string; nome: string; righe: OrdineNotaDaOrdinare[]; ordini: GruppoOrdine[]; }

@Component({
  selector: 'app-ordini-note-da-ordinare',
  templateUrl: './ordini-note-da-ordinare.component.html',
  styleUrls: ['./ordini-note-da-ordinare.component.css']
})
export class OrdiniNoteDaOrdinareComponent extends BaseComponent implements OnInit {
  righe: OrdineNotaDaOrdinare[] = [];
  gruppi: GruppoVenditore[] = [];
  venditori: {codice: string; nome: string}[] = [];
  filtroVenditore = '';
  tipo = '';
  pagina = 0;
  totaleOrdini = 0;
  get titolo(): string { return this.tipo ? DASHBOARD_VIEWS[this.tipo] : 'Articoli da ordinare con note'; }
  get queryDettaglio(): object {
    return {origine: this.tipo ? 'dashboard-articoli' : 'note-da-ordinare', tipo: this.tipo || null,
      venditore: this.filtroVenditore, pagina: this.pagina};
  }
  cambiaVenditore(): void { if (this.tipo) { this.pagina = 0; this.carica(); } }
  cambiaPagina(pagina: number): void { this.pagina = pagina; this.carica(); }

  selection = new SelectionModel<number>(true, []);
  loading = false;
  errore = false;
  erroreVenditori = false;
  private nomi = new Map<string, string>();

  constructor(private service: DashboardService, private auth: AuthService,
              public perm: PermissionService, private state: OrdiniClientiStateService, private route: ActivatedRoute) { super(); }

  ngOnInit(): void {
    this.filtroVenditore = this.route.snapshot.queryParamMap.get('venditore') || '';
    this.tipo = this.route.snapshot.paramMap?.get('tipo') || '';
    this.pagina = Math.max(0, Number(this.route.snapshot.queryParamMap.get('pagina')) || 0);
    if (this.tipo && !DASHBOARD_VIEWS[this.tipo]) { this.errore = true; return; }
    this.carica();
    if (this.perm.canFiltroVenditore) {
      this.auth.getVenditori(['Venditore']).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (utenti: {codVenditore: string; fullname: string}[]) => {
          this.nomi = new Map(utenti.filter(u => u.codVenditore).map(u => [u.codVenditore.trim(), u.fullname]));
          if (this.tipo) {
            this.venditori = utenti.filter(u => u.codVenditore).map(u => ({codice: u.codVenditore.trim(), nome: u.fullname}));
          }
          this.raggruppa();
        },
        error: () => this.erroreVenditori = true
      });
    }
  }

  carica(): void {
    this.loading = true;
    this.errore = false;
    this.selection.clear();
    if (this.tipo) {
      this.service.articoli(this.tipo, this.filtroVenditore, this.pagina).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: res => { this.righe = res.righe; this.totaleOrdini = res.totaleOrdini; this.raggruppa(); this.loading = false; },
        error: () => { this.errore = true; this.loading = false; }
      });
      return;
    }
    this.service.noteDaOrdinare().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: res => { this.righe = res; this.raggruppa(); this.loading = false; },
      error: () => { this.errore = true; this.loading = false; }
    });
  }

  raggruppa(): void {
    const venditori = new Map<string, GruppoVenditore>();
    const ordini = new Map<string, GruppoOrdine>();
    const righe = [...this.righe].sort((a, b) => {
      if (this.tipo) return a.anno - b.anno || a.serie.localeCompare(b.serie) || a.progressivo - b.progressivo || a.rigo - b.rigo;
      if (!a.dataNota) return b.dataNota ? 1 : a.progrGenerale - b.progrGenerale;
      if (!b.dataNota) return -1;
      return a.dataNota.localeCompare(b.dataNota) || a.progrGenerale - b.progrGenerale;
    });
    for (const riga of righe) {
      const codice = riga.serie.trim();
      let gruppo = venditori.get(codice);
      if (!gruppo) {
        gruppo = {codice, nome: this.nomi.get(codice) || codice || 'Venditore non indicato', righe: [], ordini: []};
        venditori.set(codice, gruppo);
      }
      gruppo.righe.push(riga);
      const chiave = `${riga.anno}/${riga.serie}/${riga.progressivo}`;
      let ordine = ordini.get(chiave);
      if (!ordine) { ordine = {chiave, righe: []}; gruppo.ordini.push(ordine); ordini.set(chiave, ordine); }
      ordine.righe.push(riga);
    }
    this.gruppi = [...venditori.values()];
    if (!this.tipo) this.venditori = this.gruppi.map(g => ({codice: g.codice, nome: g.nome})).sort((a, b) => a.nome.localeCompare(b.nome));
  }

  get gruppiVisibili(): GruppoVenditore[] {
    return this.gruppi.filter(g => !this.filtroVenditore || g.codice === this.filtroVenditore);
  }

  selezionate(gruppo: GruppoVenditore): OrdineNotaDaOrdinare[] {
    return gruppo.righe.filter(r => this.selection.isSelected(r.progrGenerale));
  }

  tutteSelezionate(gruppo: GruppoVenditore): boolean {
    return gruppo.righe.length > 0 && this.selezionate(gruppo).length === gruppo.righe.length;
  }

  alcuneSelezionate(gruppo: GruppoVenditore): boolean {
    const count = this.selezionate(gruppo).length;
    return count > 0 && count < gruppo.righe.length;
  }

  selezionaTutte(gruppo: GruppoVenditore, checked: boolean): void {
    const ids = gruppo.righe.map(r => r.progrGenerale);
    if (checked) this.selection.select(...ids); else this.selection.deselect(...ids);
  }

  preparaVistaOrdini(): void {
    const filtro = filtroDashboard(this.tipo || 'note');
    filtro.codVenditore = this.filtroVenditore;
    this.state.resetState(); this.state.setState(filtro);
  }

  preparaOrdine(riga: OrdineNotaDaOrdinare): void {
    this.state.setState({statusOrdine: riga.status, searchText: '', daCodificare: false});
  }

  condividi(gruppo: GruppoVenditore): void {
    if (this.loading || this.errore) return;
    const righe = gruppo.ordini.flatMap(o => o.righe.filter(r => this.selection.isSelected(r.progrGenerale)));
    if (!righe.length) return;
    const testo = [this.titolo.toUpperCase(), `Venditore: ${gruppo.nome}`, ''];
    let precedente = '';
    for (const riga of righe) {
      const ordine = `${riga.anno}/${riga.serie}/${riga.progressivo}`;
      if (ordine !== precedente) {
        testo.push(`Ordine: ${ordine}`, `Cliente: ${riga.cliente}`, '');
        precedente = ordine;
      }
      testo.push(`Riga ${riga.rigo} · ${riga.articolo || ''} — ${riga.descrizione || ''}`);
      if (riga.nota && riga.nota.trim().toUpperCase() !== 'NULL') testo.push(`Nota: ${riga.nota}`);
      testo.push('');
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(testo.join('\n')), '_blank', 'noopener,noreferrer');
  }
}
