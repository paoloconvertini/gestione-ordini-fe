import {fakeAsync, tick} from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import {of, Subject, throwError} from 'rxjs';
import {ConsegnaLiberaDialogComponent} from './consegna-libera-dialog.component';

describe('ConsegnaLiberaDialogComponent', () => {
  let component: ConsegnaLiberaDialogComponent;
  let lista: any;
  let clienti: any;
  let dialog: any;
  let snackbar: any;
  let showroom: any;

  beforeEach(() => {
    lista = jasmine.createSpyObj('ListaService', ['salvaConsegnaLibera']);
    lista.salvaConsegnaLibera.and.returnValue(of({}));
    clienti = jasmine.createSpyObj('PianocontiService', ['searchClienti']);
    clienti.searchClienti.and.returnValue(of([]));
    showroom = jasmine.createSpyObj('ShowroomService', ['searchComuni']);
    showroom.searchComuni.and.returnValue(of([]));
    dialog = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    const veicoli = {getVeicoli: () => of([{id: 1, descrizione: 'Furgone'}])};
    component = new ConsegnaLiberaDialogComponent(new FormBuilder(), lista, veicoli as any,
      clienti, snackbar, showroom, dialog, {});
    component.ngOnInit();
  });
  afterEach(() => component.ngOnDestroy());

  function compila() {
    component.form.patchValue({intestazione: 'Destinatario libero', indirizzo: 'Via Prova 1',
      localita: 'Martina Franca', dataConsegna: new Date(2026, 9, 21), oraConsegna: 'M', veicolo: 1});
  }

  it('salva testo libero anche senza risultati autocomplete e conserva il giorno locale', fakeAsync(() => {
    compila(); tick(300);
    expect(component.clienti).toEqual([]);
    component.conferma();
    const [payload, id] = lista.salvaConsegnaLibera.calls.mostRecent().args;
    expect(payload.intestazione).toBe('Destinatario libero');
    expect(payload.dataConsegna).toBe('2026-10-21');
    expect(payload.anno).toBeUndefined();
    expect(id).toBeUndefined();
    expect(dialog.close).toHaveBeenCalledWith(true);
  }));

  it('seleziona il cliente e precompila il luogo che resta modificabile', () => {
    component.selectCliente({intestazione: 'Cliente esistente', indirizzo: 'Via Uno', localita: 'Bari',
      telefono: '123', latitudine: 41, longitudine: 16});
    expect(component.form.value.intestazione).toBe('Cliente esistente');
    expect(component.form.value.indirizzo).toBe('Via Uno');
    expect(component.latitudine).toBe(41);
    component.form.get('indirizzo')!.setValue('Via Due');
    expect(component.latitudine).toBeNull();
    expect(component.longitudine).toBeNull();
  });

  it('cerca la località nella tabella comuni dopo tre caratteri', fakeAsync(() => {
    const risultati = [{nomeComune: 'Bari', siglaProvincia: 'BA'}];
    showroom.searchComuni.and.returnValue(of(risultati));
    component.form.get('localita')!.setValue('Ba'); tick(300);
    expect(showroom.searchComuni).not.toHaveBeenCalled();
    component.form.get('localita')!.setValue('Bari'); tick(300);
    expect(showroom.searchComuni).toHaveBeenCalledWith(null, 'Bari');
    expect(component.comuni).toEqual(risultati);
    component.form.get('localita')!.setValue(''); tick(300);
    expect(component.comuni).toEqual([]);
  }));

  it('non salva se mancano dati obbligatori o se il nome contiene solo spazi', () => {
    component.conferma();
    expect(lista.salvaConsegnaLibera).not.toHaveBeenCalled();
    compila(); component.form.get('intestazione')!.setValue('   ');
    component.conferma();
    expect(lista.salvaConsegnaLibera).not.toHaveBeenCalled();
  });

  it('annulla ricerche precedenti quando cambia il testo', fakeAsync(() => {
    const precedente = new Subject<any[]>();
    clienti.searchClienti.and.returnValues(precedente, of([{intestazione: 'Nuovo'}]));
    component.form.get('intestazione')!.setValue('Vecchio'); tick(300);
    component.form.get('intestazione')!.setValue('Nuovo'); tick(300);
    precedente.next([{intestazione: 'Vecchio'}]);
    expect(component.clienti[0].intestazione).toBe('Nuovo');
  }));

  it('consente il testo libero anche se la ricerca clienti fallisce', fakeAsync(() => {
    clienti.searchClienti.and.returnValue(throwError(() => new Error('offline')));
    compila(); tick(300);
    component.conferma();
    expect(lista.salvaConsegnaLibera).toHaveBeenCalled();
  }));

  it('in modifica usa l’identificativo della consegna libera', () => {
    component.ngOnDestroy();
    component = new ConsegnaLiberaDialogComponent(new FormBuilder(), lista,
      {getVeicoli: () => of([])} as any, clienti, snackbar, showroom, dialog,
      {consegna: {idConsegnaLibera: 42, intestazione: 'Nome', indirizzo: 'Via Uno', localita: 'Bari',
        dataConsegna: '2026-10-21', oraConsegna: 'P', veicolo: 1}});
    component.ngOnInit(); component.conferma();
    expect(lista.salvaConsegnaLibera.calls.mostRecent().args[1]).toBe(42);
  });

  it('impedisce il doppio invio e riabilita il salvataggio dopo errore', () => {
    const richiesta = new Subject<any>();
    lista.salvaConsegnaLibera.and.returnValue(richiesta);
    compila(); component.conferma(); component.conferma();
    expect(lista.salvaConsegnaLibera).toHaveBeenCalledTimes(1);
    richiesta.error(new Error('errore'));
    expect(component.saving).toBeFalse();
    expect(dialog.close).not.toHaveBeenCalled();
  });
});
