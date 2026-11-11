import {of} from 'rxjs';
import {ArticoloComponent} from './articolo.component';

describe('Seleziona tutti i pronto consegna', () => {
  let component: ArticoloComponent;
  let perm: any;
  let service: any;
  beforeEach(() => {
    perm = {canEditProntoConsegna: true};
    service = jasmine.createSpyObj('ArticoloService', ['update']);
    service.update.and.returnValue(of({error: false}));
    component = new ArticoloComponent({} as any, {} as any, service, {} as any, {} as any,
      {} as any, {} as any, {} as any, perm, {} as any, {} as any);
    component.filtro.statusOrdine = 'DA_ORDINARE';
  });
  afterEach(() => component.ngOnDestroy());

  it('seleziona le righe filtrate su tutte le pagine e usa le quantità delle checkbox singole', () => {
    const prima = {tipoRigo: ' ', flProntoConsegna: false, qtaDaConsegnare: 3, quantita: 8, visibile: true};
    const seconda = {tipoRigo: ' ', flProntoConsegna: false, quantita: 5, visibile: true};
    const esclusa = {tipoRigo: ' ', flProntoConsegna: false, quantita: 7, visibile: false};
    component.dataSource.data = [prima, seconda, esclusa];
    component.dataSource.filterPredicate = (r: any) => r.visibile;
    component.dataSource.filter = 'filtrato';
    component.selezionaTuttiProntoConsegna(true);
    expect(prima.flProntoConsegna).toBeTrue();
    expect((prima as any).qtaProntoConsegna).toBe(3);
    expect(seconda.flProntoConsegna).toBeTrue();
    expect((seconda as any).qtaProntoConsegna).toBe(5);
    expect(esclusa.flProntoConsegna).toBeFalse();
    expect(component.selection.isEmpty()).toBeTrue();
  });

  it('esclude acconti e articoli consegnati, mantenendo la regola esistente sulle righe C', () => {
    const acconto = {tipoRigo: 'AC', flProntoConsegna: false};
    const consegnato = {tipoRigo: ' ', flagConsegnato: true, flProntoConsegna: false};
    const commento = {tipoRigo: 'C', flagConsegnato: true, flProntoConsegna: false};
    component.dataSource.data = [acconto, consegnato, commento];
    component.selezionaTuttiProntoConsegna(true);
    expect(acconto.flProntoConsegna).toBeFalse();
    expect(consegnato.flProntoConsegna).toBeFalse();
    expect(commento.flProntoConsegna).toBeTrue();
  });

  it('mantiene la quantità parziale delle righe già spuntate e mostra lo stato intermedio', () => {
    const parziale = {tipoRigo: ' ', flProntoConsegna: true, qtaProntoConsegna: 2, quantita: 10};
    const nuova = {tipoRigo: ' ', flProntoConsegna: false, quantita: 4};
    component.dataSource.data = [parziale, nuova];
    expect(component.alcuniProntoConsegna).toBeTrue();
    expect(component.tuttiProntoConsegna).toBeFalse();
    component.selezionaTuttiProntoConsegna(true);
    expect(parziale.qtaProntoConsegna).toBe(2);
    expect(component.tuttiProntoConsegna).toBeTrue();
    expect(component.alcuniProntoConsegna).toBeFalse();
    component.selezionaTuttiProntoConsegna(false);
    expect(parziale.flProntoConsegna).toBeFalse();
    expect(parziale.qtaProntoConsegna).toBeUndefined();
    expect(component.alcuniProntoConsegna).toBeFalse();
  });

  it('rispetta permessi, ordine bloccato, archivio e caricamento', () => {
    const riga = {tipoRigo: ' ', flProntoConsegna: false};
    component.dataSource.data = [riga];
    perm.canEditProntoConsegna = false;
    component.selezionaTuttiProntoConsegna(true); expect(riga.flProntoConsegna).toBeFalse();
    perm.canEditProntoConsegna = true; component.ordineDettaglio.locked = true;
    component.selezionaTuttiProntoConsegna(true); expect(riga.flProntoConsegna).toBeFalse();
    component.ordineDettaglio.locked = false; component.filtro.statusOrdine = 'ARCHIVIATO';
    component.selezionaTuttiProntoConsegna(true); expect(riga.flProntoConsegna).toBeFalse();
    component.filtro.statusOrdine = 'DA_ORDINARE'; component.loader = true;
    component.selezionaTuttiProntoConsegna(true); expect(riga.flProntoConsegna).toBeFalse();
  });

  it('non considera selezionata una lista senza righe modificabili', () => {
    component.dataSource.data = [{tipoRigo: 'AC'}];
    expect(component.tuttiProntoConsegna).toBeFalse();
    expect(component.alcuniProntoConsegna).toBeFalse();
  });

  it('salva i flag e le quantità usando il flusso di salvataggio esistente', () => {
    const riga = {tipoRigo: ' ', flProntoConsegna: false, quantita: 6};
    component.dataSource.data = [riga];
    spyOn(component, 'getArticoliByOrdineId');
    component.selezionaTuttiProntoConsegna(true);
    expect(service.update).not.toHaveBeenCalled();
    component.salvaOrdine();
    expect(service.update).toHaveBeenCalledWith([jasmine.objectContaining({flProntoConsegna: true, qtaProntoConsegna: 6})]);
  });
});
