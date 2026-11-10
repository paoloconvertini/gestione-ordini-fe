import {MapComponent} from './map.component';

describe('MapComponent consegne indipendenti', () => {
  let component: MapComponent;
  beforeEach(() => component = new MapComponent({} as any, {} as any));

  it('distingue due consegne senza numero ordine nel confronto del percorso', () => {
    component.currentOrder = [{idConsegnaLibera: 1}, {idConsegnaLibera: 2}];
    expect(component.isChanged({idConsegnaLibera: 2}, 0)).toBeTrue();
    expect(component.isChanged({idConsegnaLibera: 2}, 1)).toBeFalse();
  });

  it('conserva gli identificativi di entrambi i tipi quando applica il percorso', () => {
    spyOn(component, 'rejectOptimization');
    spyOn(component.optimizationApplied, 'emit');
    component.optimizedOrder = [{idConsegnaLibera: 2}, {anno: 2026, serie: 'A', progressivo: 4}];
    component.applyOptimization();
    const result = (component.optimizationApplied.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(result[0].idConsegnaLibera).toBe(2);
    expect(result[0].ordine).toBe(1);
    expect(result[1].progressivo).toBe(4);
    expect(result[1].ordine).toBe(2);
  });
});
