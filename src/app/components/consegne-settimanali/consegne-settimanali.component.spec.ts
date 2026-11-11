import {of} from 'rxjs';
import {ConsegneSettimanaliComponent} from './consegne-settimanali.component';
import {ConsegnaLiberaDialogComponent} from '../consegna-libera-dialog/consegna-libera-dialog.component';

describe('ConsegneSettimanaliComponent', () => {
  let component: ConsegneSettimanaliComponent;
  let service: any;
  let dialog: any;
  beforeEach(() => {
    service = jasmine.createSpyObj('ListaService', ['eliminaConsegnaLibera', 'eliminaProgrammazione', 'riordinaConsegne']);
    service.eliminaConsegnaLibera.and.returnValue(of({}));
    service.eliminaProgrammazione.and.returnValue(of({}));
    service.riordinaConsegne.and.returnValue(of({}));
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue({afterClosed: () => of(true)});
    component = new ConsegneSettimanaliComponent({} as any, {} as any, service, dialog,
      {open: () => {}} as any, {} as any, {} as any);
    spyOn(component, 'retrieveList');
  });
  afterEach(() => component.ngOnDestroy());

  it('apre il modulo della consegna libera senza richiedere articoli ordine', () => {
    const consegna = {idConsegnaLibera: 4};
    component.dettaglio(consegna);
    expect(dialog.open.calls.mostRecent().args[0]).toBe(ConsegnaLiberaDialogComponent);
    expect(dialog.open.calls.mostRecent().args[1].data.consegna).toBe(consegna);
  });

  it('elimina la consegna indipendente usando il proprio id', () => {
    component.eliminaConsegna({idConsegnaLibera: 4});
    expect(service.eliminaConsegnaLibera).toHaveBeenCalledWith(4);
    expect(service.eliminaProgrammazione).not.toHaveBeenCalled();
  });

  it('continua a eliminare la programmazione ordine usando anno serie progressivo', () => {
    component.eliminaConsegna({anno: 2026, serie: 'A', progressivo: 1});
    expect(service.eliminaProgrammazione).toHaveBeenCalledWith(2026, 'A', 1);
    expect(service.eliminaConsegnaLibera).not.toHaveBeenCalled();
  });

  it('trasmette gli identificativi distinti nel riordino di un giro misto', () => {
    const veicolo = {consegne: [{anno: 2026, serie: 'A', progressivo: 1}, {idConsegnaLibera: 4}]};
    component.drop({previousIndex: 1, currentIndex: 0} as any, veicolo);
    const payload = service.riordinaConsegne.calls.mostRecent().args[0];
    expect(payload[0].idConsegnaLibera).toBe(4);
    expect(payload[0].ordine).toBe(1);
    expect(payload[1].progressivo).toBe(1);
    expect(payload[1].ordine).toBe(2);
  });
});
