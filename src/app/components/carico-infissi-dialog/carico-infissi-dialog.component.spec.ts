import {FormBuilder} from '@angular/forms';
import {of, Subject, throwError} from 'rxjs';
import {CaricoInfissiDialogComponent} from './carico-infissi-dialog.component';

describe('CaricoInfissiDialogComponent', () => {
  let component: CaricoInfissiDialogComponent;
  let service: any;
  let dialog: any;
  const anteprima = {totaleImponibile: 100, quantitaTotale: 3, costoUnitario: 33.33333333,
    righe: [{progrGenerale: 1, rigo: 1, articolo: 'INF', descrizione: 'Infisso', quantita: 3, imponibile: 100}]};
  beforeEach(() => {
    service = jasmine.createSpyObj('service', ['getVettori', 'getCausali', 'anteprimaInfissi', 'caricaInfissi']);
    service.getVettori.and.returnValue(of([])); service.getCausali.and.returnValue(of([]));
    service.anteprimaInfissi.and.returnValue(of(anteprima)); service.caricaInfissi.and.returnValue(of({msg: 'Creato', error: false}));
    dialog = jasmine.createSpyObj('dialog', ['close']);
    component = new CaricoInfissiDialogComponent(new FormBuilder(), service, dialog, [{progrGenerale: 1, quantita: 3}]);
    component.ngOnInit();
    component.form.patchValue({numDoc: 'DDT-1/A', causale: 'C01', vettore: 'V01', totaleImponibile: 100});
  });
  afterEach(() => component.ngOnDestroy());

  it('richiede importo in centesimi e anteprima prima di salvare', () => {
    component.salva(); expect(service.caricaInfissi).not.toHaveBeenCalled();
    component.form.patchValue({totaleImponibile: 100.001}); component.calcola();
    expect(service.anteprimaInfissi).not.toHaveBeenCalled();
    component.form.patchValue({totaleImponibile: 100}); component.calcola();
    expect(component.anteprima).toEqual(anteprima);
    const richiesta = service.anteprimaInfissi.calls.mostRecent().args[0];
    expect(richiesta.numDoc).toBe('DDT-1/A'); expect(richiesta.articoli).toEqual([{progrGenerale: 1, quantita: 3}]);
    expect(richiesta.dataDocumento).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    component.salva(); expect(dialog.close).toHaveBeenCalledWith({msg: 'Creato', error: false});
  });

  it('invalida la ripartizione dopo una modifica e scarta risposte obsolete', () => {
    const risposta = new Subject<any>(); service.anteprimaInfissi.and.returnValue(risposta);
    component.calcola(); component.form.patchValue({totaleImponibile: 101}); risposta.next(anteprima);
    expect(component.anteprima).toBeNull();
    component.salva(); expect(service.caricaInfissi).not.toHaveBeenCalled();
  });

  it('impedisce il doppio invio e la chiusura durante il salvataggio', () => {
    const risposta = new Subject<any>(); service.caricaInfissi.and.returnValue(risposta);
    component.calcola(); component.salva(); component.salva(); component.chiudi();
    expect(service.caricaInfissi).toHaveBeenCalledTimes(1); expect(dialog.disableClose).toBeTrue();
    expect(dialog.close).not.toHaveBeenCalled();
    risposta.error({error: {message: 'Fornitore mancante'}});
    expect(component.errore).toBe('Fornitore mancante'); expect(component.form.enabled).toBeTrue();
    expect(component.anteprima).toBeNull(); expect(dialog.disableClose).toBeFalse();
  });

  it('mostra gli errori di caricamento senza registrare movimenti', () => {
    service.anteprimaInfissi.and.returnValue(throwError(() => ({error: {message: 'Quantità cambiata'}})));
    component.calcola(); expect(component.errore).toBe('Quantità cambiata');
    expect(service.caricaInfissi).not.toHaveBeenCalled();
  });
});
