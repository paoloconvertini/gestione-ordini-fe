import {of, Subject, throwError} from 'rxjs';
import {OafListComponent} from './oaf-list.component';
import {PageEvent} from '@angular/material/paginator';

describe('OafListComponent: unione ordini', () => {
  let component: OafListComponent;
  let service: any;
  let dialog: any;
  let snack: any;
  const a = {anno: 2026, serie: 'A', progressivo: 1, intestazione: 'Tubes', dataOrdine: '2026-11-01'};
  const b = {anno: 2026, serie: 'B', progressivo: 2, intestazione: 'Atlas', dataOrdine: '2026-11-01'};
  beforeEach(() => {
    service = jasmine.createSpyObj('service', ['anteprimaUnione', 'unisciOrdini', 'getAllOaf']);
    service.anteprimaUnione.and.returnValue(of({ordini: [a,b], fornitoriDiversi: true, versione: 'snapshot'}));
    service.unisciOrdini.and.returnValue(of({msg: 'Ordini unificati!', error: false}));
    service.getAllOaf.and.returnValue(of([a,b]));
    dialog = jasmine.createSpyObj('dialog', ['open']); dialog.open.and.returnValue({afterClosed: () => of(true)});
    snack = jasmine.createSpyObj('snack', ['open']);
    component = new OafListComponent(snack, {} as any, dialog, service, {} as any, {} as any,
      {setState: jasmine.createSpy('state')} as any);
    component.selection.select(a,b);
  });
  afterEach(() => component.ngOnDestroy());

  it('pulisce selezioni su ricerca, ricaricamento e stato', () => {
    component.dataSource.data = [a,b]; component.filtro.searchText = 'Tubes'; component.applyFilter();
    expect(component.selection.isEmpty()).toBeTrue();
    component.selection.select(a); component.retrieveFornitoreList(); expect(component.selection.isEmpty()).toBeTrue();
    component.selection.select(a); component.onStatusChange(); expect(component.selection.isEmpty()).toBeTrue();
  });
  it('mantiene le selezioni tra pagine e invia entrambi gli ordini all’anteprima', () => {
    component.selection.clear();
    component.dataSource.data = [a,b];
    component.selection.select(a);
    component.pageEvent({pageIndex: 1, pageSize: 1} as PageEvent);
    expect(component.selection.isSelected(a)).toBeTrue();
    component.selection.select(b);
    component.pageEvent({pageIndex: 0, pageSize: 1} as PageEvent);
    expect(component.selection.isSelected(a)).toBeTrue();
    expect(component.selection.isSelected(b)).toBeTrue();
    component.unisciOrdini();
    expect(service.anteprimaUnione).toHaveBeenCalledWith([
      {anno: 2026, serie: 'A', progressivo: 1},
      {anno: 2026, serie: 'B', progressivo: 2}
    ]);
  });
  it('evidenzia fornitori diversi rispetto alla destinazione e ricalcola dopo la deselezione', () => {
    const tubes = {...a, gruppo: 2351, conto: '011000'};
    const stesso = {...b, gruppo: 2351, conto: '011000 '};
    const atlas = {...b, gruppo: 2351, conto: '010507'};
    component.selection.clear();
    component.selection.select(tubes, stesso, atlas);
    expect(component.fornitoreDiversoSelezionato(tubes)).toBeFalse();
    expect(component.fornitoreDiversoSelezionato(stesso)).toBeFalse();
    expect(component.fornitoreDiversoSelezionato(atlas)).toBeTrue();
    const recente = {...atlas, anno: 2027};
    component.selection.select(recente);
    expect(component.fornitoreDiversoSelezionato(tubes)).toBeTrue();
    expect(component.fornitoreDiversoSelezionato(recente)).toBeFalse();
    component.selection.deselect(recente);
    expect(component.fornitoreDiversoSelezionato(tubes)).toBeFalse();
    component.selection.clear();
    expect(component.fornitoreDiversoSelezionato(atlas)).toBeFalse();
  });
  it('non esegue unioni annullate e mostra l’anteprima server', () => {
    dialog.open.and.returnValue({afterClosed: () => of(false)}); component.unisciOrdini();
    expect(dialog.open.calls.mostRecent().args[1].data.fornitoriDiversi).toBeTrue();
    expect(service.unisciOrdini).not.toHaveBeenCalled(); expect(component.unioneInCorso).toBeFalse();
  });
  it('invia conferma e versione solo dopo il dialog e svuota la selezione', () => {
    component.unisciOrdini();
    expect(service.unisciOrdini).toHaveBeenCalledWith([
      {anno: 2026, serie: 'A', progressivo: 1}, {anno: 2026, serie: 'B', progressivo: 2}], true, 'snapshot');
    expect(component.selection.isEmpty()).toBeTrue(); expect(component.unioneInCorso).toBeFalse();
  });
  it('mostra gli errori HTTP senza messaggi di successo e libera il loader', () => {
    service.unisciOrdini.and.returnValue(throwError(() => ({status: 500, error: {msg: 'Unione annullata'}})));
    component.unisciOrdini();
    expect(snack.open).toHaveBeenCalledWith('Unione annullata', 'Chiudi');
    expect(service.getAllOaf).not.toHaveBeenCalled(); expect(component.loader).toBeFalse();
    expect(component.unioneInCorso).toBeFalse(); expect(component.selection.isEmpty()).toBeTrue();
  });
  it('gestisce un errore di anteprima senza aprire la conferma', () => {
    service.anteprimaUnione.and.returnValue(throwError(() => ({error: {message: 'Ordine non più presente'}})));
    component.unisciOrdini(); expect(dialog.open).not.toHaveBeenCalled();
    expect(service.unisciOrdini).not.toHaveBeenCalled();
    expect(snack.open).toHaveBeenCalledWith('Ordine non più presente', 'Chiudi');
  });
  it('scarta anteprime diventate obsolete dopo il cambio di selezione', () => {
    const risposta = new Subject<any>(); service.anteprimaUnione.and.returnValue(risposta);
    component.unisciOrdini(); component.applyFilter();
    risposta.next({ordini: [a,b], fornitoriDiversi: true, versione: 'snapshot'});
    expect(dialog.open).not.toHaveBeenCalled(); expect(service.unisciOrdini).not.toHaveBeenCalled();
    expect(component.unioneInCorso).toBeFalse();
  });
  it('non invia una selezione singola e impedisce il doppio invio', () => {
    component.selection.clear(); component.selection.select(a); component.unisciOrdini();
    expect(service.anteprimaUnione).not.toHaveBeenCalled();
    component.selection.select(b); const risposta = new Subject<any>(); service.unisciOrdini.and.returnValue(risposta);
    component.unisciOrdini(); component.unisciOrdini(); expect(service.unisciOrdini).toHaveBeenCalledTimes(1);
    risposta.next({error: false, msg: 'Ordini unificati!'}); expect(component.loader).toBeFalse();
  });
});
