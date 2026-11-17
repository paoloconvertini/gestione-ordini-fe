import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {BaseComponent} from '../baseComponent';
import {DashboardService} from '../../services/dashboard/dashboard.service';
import {PagamentoOrdine} from '../../models/pagamento-ordine';
import {AuthService} from '../../services/auth/auth.service';
import {OrdiniClientiStateService} from '../../services/state/ordini-clienti-state.service';

interface OrdinePagamenti { chiave: string; righe: PagamentoOrdine[]; }
interface VenditorePagamenti { codice: string; nome: string; ordini: OrdinePagamenti[]; }

@Component({
  selector: 'app-modalita-pagamento',
  templateUrl: './modalita-pagamento.component.html',
  styleUrls: ['./modalita-pagamento.component.css']
})
export class ModalitaPagamentoComponent extends BaseComponent implements OnInit {
  righe: PagamentoOrdine[] = [];
  gruppi: VenditorePagamenti[] = [];
  venditori: {codice: string; nome: string}[] = [];
  filtroVenditore = '';
  filtroStato = 'DA_FATTURARE';
  loading = false;
  errore = '';
  erroreVenditori = false;
  ultimoControllo: string | null = null;
  oggi = new Intl.DateTimeFormat('it-IT', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome'}).format(new Date());
  readonly stati: {[key: string]: string} = {
    DA_FATTURARE: 'Da fatturare', ANOMALIA: 'Da verificare', PROGRAMMATO: 'Programmato',
    AL_PRONTO: 'Al pronto', EMESSO: 'Già emesso', NON_DOVUTO: 'Non dovuto'
  };

  constructor(private service: DashboardService, private route: ActivatedRoute,
              private auth: AuthService, private state: OrdiniClientiStateService) { super(); }

  ngOnInit(): void {
    this.filtroVenditore = this.route.snapshot.queryParamMap.get('venditore') || '';
    const stato = this.route.snapshot.queryParamMap.get('stato') || 'DA_FATTURARE';
    this.filtroStato = stato === 'TUTTI' || this.stati[stato] ? stato : 'DA_FATTURARE';
    this.carica();
    this.auth.getVenditori(['Venditore']).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (utenti: {codVenditore: string; fullname: string}[]) => {
        this.venditori = utenti.filter(u => u.codVenditore).map(u => ({codice: u.codVenditore.trim(), nome: u.fullname}));
        this.raggruppa();
      },
      error: () => this.erroreVenditori = true
    });
  }

  carica(): void {
    this.loading = true;
    this.errore = '';
    this.service.pagamenti().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: righe => this.ricevi(righe),
      error: () => { this.errore = 'Impossibile caricare le scadenze. Riprova.'; this.loading = false; }
    });
  }

  private ricevi(righe: PagamentoOrdine[]): void {
    this.righe = righe;
    this.ultimoControllo = righe.map(r => r.controllatoIl).filter(Boolean).sort().pop() || null;
    this.raggruppa();
    this.loading = false;
  }

  raggruppa(): void {
    const gruppi = new Map<string, VenditorePagamenti>();
    const ordini = new Map<string, OrdinePagamenti>();
    const righe = this.righe.filter(r =>
      (!this.filtroVenditore || r.serie.trim() === this.filtroVenditore) &&
      (this.filtroStato === 'TUTTI' || r.stato === this.filtroStato))
      .sort((a,b) => a.serie.localeCompare(b.serie) || a.anno-b.anno || a.progressivo-b.progressivo || a.rigo-b.rigo);
    for (const r of righe) {
      const codice = r.serie.trim();
      let venditore = gruppi.get(codice);
      if (!venditore) {
        venditore = {codice, nome: this.venditori.find(v => v.codice === codice)?.nome || 'Venditore', ordini: []};
        gruppi.set(codice, venditore);
      }
      const chiave = r.anno+'/'+r.serie+'/'+r.progressivo;
      let ordine = ordini.get(chiave);
      if (!ordine) { ordine = {chiave, righe: []}; ordini.set(chiave, ordine); venditore.ordini.push(ordine); }
      ordine.righe.push(r);
    }
    this.gruppi = [...gruppi.values()];
  }

  preparaOrdine(riga: PagamentoOrdine): void {
    this.state.setState({statusOrdine: riga.statoOrdine, searchText: '', daCodificare: false});
  }
}
