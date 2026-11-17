import {of, throwError} from 'rxjs';
import {ModalitaPagamentoComponent} from './modalita-pagamento.component';
import {PagamentoOrdine} from '../../models/pagamento-ordine';

describe('ModalitaPagamentoComponent', () => {
  let component: ModalitaPagamentoComponent;
  let service: any;
  const riga = (id: number, stato: PagamentoOrdine['stato'], serie = '14') =>
    ({progrGenerale: id, anno: 2026, serie, progressivo: 100, rigo: id, stato,
      statoOrdine: 'COMPLETO', controllatoIl: '2026-11-17T12:00:00'} as PagamentoOrdine);
  beforeEach(() => {
    service = jasmine.createSpyObj('service', ['pagamenti']);
    service.pagamenti.and.returnValue(of([riga(1,'DA_FATTURARE'),riga(2,'EMESSO'),riga(3,'ANOMALIA','11')]));
    component = new ModalitaPagamentoComponent(service, {snapshot: {queryParamMap: {get: () => null}}} as any,
      {getVenditori: () => of([{codVenditore: '14',fullname: 'Venditore Test'}])} as any, {} as any);
  });
  afterEach(() => component.ngOnDestroy());
  it('apre subito solo le tranche da fatturare senza anomalie o acconti già emessi', () => {
    component.ngOnInit();
    expect(component.gruppi.length).toBe(1);
    expect(component.gruppi.flatMap(g => g.ordini.flatMap(o => o.righe)).map(r => r.progrGenerale)).toEqual([1]);
    expect(component.gruppi.find(g => g.codice === '14')?.nome).toBe('Venditore Test');
  });
  it('filtra venditore e mostra anche gli emessi su richiesta', () => {
    component.ngOnInit();
    component.filtroVenditore = '14'; component.filtroStato = 'EMESSO'; component.raggruppa();
    expect(component.gruppi.length).toBe(1);
    expect(component.gruppi[0].ordini[0].righe.map(r => r.progrGenerale)).toEqual([2]);
  });
  it('aggiorna solo la lista salvata e conserva i dati validi in caso di errore', () => {
    component.ngOnInit(); component.carica();
    expect(service.pagamenti).toHaveBeenCalledTimes(2);
    service.pagamenti.and.returnValue(throwError(() => new Error('errore')));
    component.carica();
    expect(component.errore).toContain('Impossibile caricare');
    expect(component.righe.length).toBe(3);
    expect(component.loading).toBeFalse();
  });
});
