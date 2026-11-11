import { of, Subject } from 'rxjs';
import { ArticoloComponent } from './articolo.component';

describe('ArticoloComponent: ingresso da codificare', () => {
  function crea(daCodificare: boolean, statusOrdine: string) {
    const component = new ArticoloComponent({} as any, {} as any, {} as any, {} as any,
      {getCurrentUser: () => ({username: 'Test'})} as any, {} as any, {} as any,
      {params: of({anno: 2026, serie: '14', progressivo: 123})} as any,
      {canDefaultFiltroNonDisponibile: true} as any,
      {getState: () => ({daCodificare, statusOrdine, searchText: 'vecchio filtro'})} as any, {} as any);
    spyOn(component, 'getArticoliByOrdineId');
    return component;
  }

  for (const status of ['DA_ORDINARE', 'COMPLETO', 'INCOMPLETO']) {
    it('mostra le righe da codificare senza filtri automatici per ' + status, () => {
      const component = crea(true, status);
      component.ngOnInit();
      expect(component.filtroArticoli.flDaCodificare).toBeTrue();
      expect(component.filtroArticoli.flNonDisponibile).toBeFalse();
      expect(component.filtroArticoli.flConsegna).toBe(3);
      expect(component.filtro.searchText).toBe('');
      expect(component.getArticoliByOrdineId).toHaveBeenCalledTimes(1);
      component.ngOnDestroy();
    });
  }

  it('conserva il filtro automatico quando non arriva dalla lista da codificare', () => {
    const component = crea(false, 'DA_ORDINARE');
    component.ngOnInit();
    expect(component.filtroArticoli.flNonDisponibile).toBeTrue();
    expect(component.filtroArticoli.flDaCodificare).toBeFalse();
    component.ngOnDestroy();
  });

  it('consente di disattivare il filtro codifica e ricaricare l’ordine', () => {
    const component = crea(true, 'DA_ORDINARE');
    component.ngOnInit();
    component.filtroArticoli.flDaCodificare = false;
    component.onDaCodificareChange();
    expect(component.getArticoliByOrdineId).toHaveBeenCalledTimes(2);
    component.ngOnDestroy();
  });
});

describe('ArticoloComponent: navigazione di ritorno', () => {
  let component: ArticoloComponent;
  let service: any;
  let router: any;
  let route: any;
  beforeEach(() => {
    service = jasmine.createSpyObj('ArticoloService', ['annulla']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    route = {snapshot: {queryParamMap: new Map([['origine', 'note-da-ordinare'], ['venditore', '11']])}};
    component = new ArticoloComponent({} as any, {} as any, service, {} as any,
      {} as any, {} as any, router, route, {} as any, {} as any, {} as any);
    component.user = 'Test';
    component.filtroArticoli.anno = 2026; component.filtroArticoli.serie = 'A'; component.filtroArticoli.progressivo = 7;
  });
  afterEach(() => component.ngOnDestroy());

  it('attende lo sblocco del proprio ordine prima di tornare alla dashboard', () => {
    const risposta = new Subject<any>(); service.annulla.and.returnValue(risposta);
    component.ordineDettaglio.userLock = 'Test';
    component.annulla('/dashboard');
    expect(service.annulla).toHaveBeenCalledWith(2026, 'A', 7);
    expect(router.navigate).not.toHaveBeenCalled();
    risposta.next({err: false});
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], {});
  });

  it('torna agli articoli con note mantenendo il venditore dopo lo sblocco', () => {
    const risposta = new Subject<any>(); service.annulla.and.returnValue(risposta);
    component.ordineDettaglio.userLock = 'Test';
    expect(component.daNoteDaOrdinare).toBeTrue();
    component.annulla('/ordini-note-da-ordinare');
    expect(router.navigate).not.toHaveBeenCalled();
    risposta.next({err: false});
    expect(router.navigate).toHaveBeenCalledWith(['/ordini-note-da-ordinare'], {queryParams: {venditore: '11'}});
  });

  it('non esce dal dettaglio se lo sblocco non riesce', () => {
    service.annulla.and.returnValue(of({err: true})); component.ordineDettaglio.userLock = 'Test';
    component.annulla('/dashboard');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('mantiene il ritorno ordinario alla lista e non sblocca ordini di altri utenti', () => {
    component.ordineDettaglio.userLock = 'Altro';
    component.annulla(); expect(router.navigate).toHaveBeenCalledWith(['/ordini-clienti'], {});
    component.annulla('/dashboard'); expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], {});
    expect(service.annulla).not.toHaveBeenCalled();
  });
});
