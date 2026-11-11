import {of, throwError} from 'rxjs';
import {OrdiniNoteDaOrdinareComponent} from './ordini-note-da-ordinare.component';
import {OrdineNotaDaOrdinare} from '../../services/dashboard/dashboard.service';

describe('OrdiniNoteDaOrdinareComponent', () => {
  let component: OrdiniNoteDaOrdinareComponent;
  let service: any;
  let auth: any;
  let state: any;
  const riga = (id: number, serie: string, ordine: number, dataNota: string | null): OrdineNotaDaOrdinare => ({
    anno: 2026, serie, progressivo: ordine, cliente: 'Cliente ' + ordine, status: 'INCOMPLETO',
    progrGenerale: id, rigo: id, articolo: 'ART' + id, descrizione: 'Articolo ' + id,
    nota: 'Misura da verificare & confermare ' + id, dataNota
  });
  beforeEach(() => {
    service = jasmine.createSpyObj('DashboardService', ['noteDaOrdinare']);
    service.noteDaOrdinare.and.returnValue(of([
      riga(1, 'A', 10, '2026-03-01T10:00:00'), riga(2, 'A', 10, '2026-01-01T10:00:00'),
      riga(3, 'B', 20, '2026-02-01T10:00:00'), riga(4, 'A', 11, null)
    ]));
    auth = jasmine.createSpyObj('AuthService', ['getVenditori']);
    auth.getVenditori.and.returnValue(of([{codVenditore: 'A', fullname: 'Anna'}, {codVenditore: 'B', fullname: 'Bruno'}]));
    state = jasmine.createSpyObj('state', ['setState']);
    component = new OrdiniNoteDaOrdinareComponent(service, auth, {canFiltroVenditore: true} as any, state);
    component.ngOnInit();
  });
  afterEach(() => component.ngOnDestroy());

  it('raggruppa per venditore e ordine, ordinando le note più vecchie prima delle recenti e di quelle senza data', () => {
    expect(component.gruppi.map(g => g.nome)).toEqual(['Anna', 'Bruno']);
    expect(component.gruppi[0].ordini.map(o => o.chiave)).toEqual(['2026/A/10', '2026/A/11']);
    expect(component.gruppi[0].ordini[0].righe.map(r => r.progrGenerale)).toEqual([2, 1]);
    component.filtroVenditore = 'B';
    expect(component.gruppiVisibili.map(g => g.nome)).toEqual(['Bruno']);
  });

  it('seleziona tutte le righe di un solo venditore e gestisce selezione parziale e deselezione', () => {
    const gruppo = component.gruppi[0];
    component.selection.select(2); expect(component.alcuneSelezionate(gruppo)).toBeTrue();
    component.selezionaTutte(gruppo, true);
    expect(component.tutteSelezionate(gruppo)).toBeTrue();
    expect(component.selection.isSelected(3)).toBeFalse();
    component.selezionaTutte(gruppo, false);
    expect(component.selection.isEmpty()).toBeTrue();
  });

  it('condivide solo le righe selezionate del venditore richiesto con ordine cliente descrizione e nota', () => {
    const open = spyOn(window, 'open');
    component.selection.select(1, 3);
    component.condividi(component.gruppi[0]);
    expect(open).toHaveBeenCalledTimes(1);
    const url = open.calls.mostRecent().args[0] as string;
    expect(url.startsWith('https://wa.me/?text=')).toBeTrue();
    const testo = decodeURIComponent(url.split('?text=')[1]);
    expect(testo).toContain('Venditore: Anna'); expect(testo).toContain('Ordine: 2026/A/10');
    expect(testo).toContain('Cliente: Cliente 10'); expect(testo).toContain('Articolo 1');
    expect(testo).toContain('Misura da verificare & confermare 1');
    expect(testo).not.toContain('Articolo 2'); expect(testo).not.toContain('Articolo 3');
  });

  it('mantiene ogni ordine in un unico blocco del messaggio anche con date alternate', () => {
    component.righe = [riga(1, 'A', 10, '2026-01-01'), riga(2, 'A', 11, '2026-02-01'), riga(3, 'A', 10, '2026-03-01')];
    component.raggruppa(); component.selezionaTutte(component.gruppi[0], true);
    const open = spyOn(window, 'open'); component.condividi(component.gruppi[0]);
    const testo = decodeURIComponent((open.calls.mostRecent().args[0] as string).split('?text=')[1]);
    expect(testo.split('Ordine: 2026/A/10').length - 1).toBe(1);
  });

  it('non apre WhatsApp senza selezione o quando la lista non è disponibile', () => {
    const open = spyOn(window, 'open'); component.condividi(component.gruppi[0]);
    component.selection.select(1); component.errore = true; component.condividi(component.gruppi[0]);
    expect(open).not.toHaveBeenCalled();
  });

  it('aggiorna le note e azzera la selezione per non condividere dati precedenti', () => {
    component.selection.select(1); service.noteDaOrdinare.and.returnValue(of([])); component.carica();
    expect(component.gruppi).toEqual([]); expect(component.selection.isEmpty()).toBeTrue();
    service.noteDaOrdinare.and.returnValue(throwError(() => new Error('offline'))); component.carica();
    expect(component.errore).toBeTrue(); expect(component.loading).toBeFalse();
  });

  it('usa i codici venditore se la lettura dei nomi fallisce', () => {
    auth.getVenditori.and.returnValue(throwError(() => new Error('offline')));
    component = new OrdiniNoteDaOrdinareComponent(service, auth, {canFiltroVenditore: true} as any, state);
    component.ngOnInit(); expect(component.erroreVenditori).toBeTrue(); expect(component.gruppi[0].nome).toBe('A');
  });

  it('prepara il dettaglio senza il precedente filtro da codificare', () => {
    component.preparaOrdine(component.righe[0]);
    expect(state.setState).toHaveBeenCalledWith({statusOrdine: 'INCOMPLETO', searchText: '', daCodificare: false});
  });
});
