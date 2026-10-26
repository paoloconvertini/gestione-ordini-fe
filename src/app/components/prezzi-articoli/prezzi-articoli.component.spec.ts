import { StoricoPrezziDialogComponent } from './storico-prezzi-dialog.component';
import { of, throwError } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrezziArticoliComponent } from './prezzi-articoli.component';
import { PrezziArticoliService } from '../../services/prezzi-articoli/prezzi-articoli.service';
import { PermissionService } from '../../services/auth/permission.service';
import { PrezzoArticolo } from '../../models/prezzo-articolo';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../services/auth/auth.service';
import { RicaricoDeselezionatiDialogComponent, RicaricoDeselezionatiResult } from './ricarico-deselezionati-dialog.component';

describe('PrezziArticoliComponent', () => {
  let component: PrezziArticoliComponent;
  let service: jasmine.SpyObj<PrezziArticoliService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  const articolo: PrezzoArticolo = {
    articolo: '4141030000100', descrizione: 'Flessibile', giacenzaTotale: 10, giacenze: [{magazzino: 'B', giacenza: 10}], unitaMisura: 'PZ', unitaAcquisto: 'PZ',
    bloccato: '', costoUltimo: 100, costoRiferimento: 100, costoRettificato: false, prezzoBase: 130, ricaricoAttuale: 30, nuovoPrezzo: 145,
    movimento: 123, dataUltimoAcquisto: '2024-01-01', motivoEsclusione: null, aggiornabile: true
  };

  beforeEach(() => {
    service = jasmine.createSpyObj('PrezziArticoliService', ['cerca', 'aggiorna', 'classiFornitore', 'salvaSoglia']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    const snackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    const perm = { canGestisciPrezziArticoli: true } as PermissionService;
    component = new PrezziArticoliComponent(service, dialog, snackbar as MatSnackBar, perm);
    component.classiFornitore = [{ codice: '414', descrizione: 'LUXOR' }, { codice: '710', descrizione: 'PAFFONI' }];
    component.classeA1 = '414';
    component.percentuale = 45;
    service.cerca.and.returnValue(risultato([articolo, { ...articolo, articolo: '414', aggiornabile: false,
      nuovoPrezzo: null, motivoEsclusione: 'Costo ultimo non disponibile' }]));
    service.aggiorna.and.returnValue(of({ msg: 'Aggiornati', error: false }));
  });

  afterEach(() => component.ngOnDestroy());

  function risultato(articoli: PrezzoArticolo[], ricaricoImpostato: number | null = null) {
    return of({ articoli, ricaricoImpostato });
  }

  it('apre la cronologia del singolo articolo senza cambiare selezioni o prezzi', () => {
    component.cerca(true);
    component.apriStorico(articolo);
    expect(dialog.open).toHaveBeenCalledOnceWith(StoricoPrezziDialogComponent, {
      width: '750px', maxWidth: '95vw', maxHeight: '90vh',
      data: { articolo: articolo.articolo, descrizione: articolo.descrizione }
    });
    expect(component.selezionati).toEqual([articolo]);
    expect(service.aggiorna).not.toHaveBeenCalled();
  });

  it('mostra prima gli aggiornabili e lascia tutti i senza costo in fondo anche dopo annulla anteprima', () => {
    const senzaCosto = {...articolo, articolo: 'A', costoUltimo: null, aggiornabile: false};
    const bloccato = {...articolo, articolo: 'B', aggiornabile: false};
    const aggiornabile = {...articolo, articolo: 'C'};
    const costoZero = {...articolo, articolo: 'D', costoUltimo: 0, aggiornabile: false};
    service.cerca.and.returnValue(risultato([senzaCosto, bloccato, aggiornabile, costoZero]));
    component.cerca(true);
    expect((component.dataSource.data as PrezzoArticolo[]).map(a => a.articolo)).toEqual(['C', 'B', 'A', 'D']);
    expect(component.selezionati.map(a => a.articolo)).toEqual(['C']);
    component.annullaAnteprima();
    expect((component.dataSource.data as PrezzoArticolo[]).map(a => a.articolo)).toEqual(['C', 'B', 'A', 'D']);
  });

  it('annulla l’anteprima ripristinando tutte le righe senza chiamare il backend', () => {
    component.cerca(true);
    const righe = component.articoli;
    service.cerca.calls.reset();
    component.portaASoglia = true;
    component.annullaAnteprima();
    expect(component.percentualeAnteprima).toBeNull();
    expect(component.percentuale).toBeNull();
    expect(component.portaASoglia).toBeFalse();
    expect(component.selezionati.length).toBe(0);
    expect(component.dataSource.data).toEqual(righe);
    expect(service.cerca).not.toHaveBeenCalled();
    expect(service.aggiorna).not.toHaveBeenCalled();
  });

  it('cambiando fornitore azzera subito il ricavo e invalida la vecchia anteprima', () => {
    component.cerca(true);
    component.cambiaFornitore('710');
    expect(component.classeA1).toBe('710');
    expect(component.percentuale).toBeNull();
    expect(component.percentualeAnteprima).toBeNull();
    expect(component.selection.isEmpty()).toBeTrue();
    expect(component.puoApplicare).toBeFalse();
    component.cerca();
    expect(service.cerca.calls.mostRecent().args).toEqual(['710', null, false]);
    expect(component.percentuale).toBeNull();
  });

  it('cambiando fornitore cancella anche un ricavo inserito senza anteprima', () => {
    component.cerca();
    component.percentuale = 35;
    component.cambiaFornitore('71');
    expect(component.percentuale).toBeNull();
    component.cambiaFornitore('710');
    expect(component.percentuale).toBeNull();
    expect(service.aggiorna).not.toHaveBeenCalled();
  });

  it('mostra soglia e delta solo dopo un salvataggio e rispetto al fornitore caricato', () => {
    component.cerca();
    expect(component.sogliaVisibile).toBeNull();
    expect(component.deltaRicarico(articolo)).toBeNull();
    service.cerca.and.returnValue(risultato([articolo], 60));
    component.cerca();
    expect(component.sogliaVisibile).toBe(60);
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: 58 })).toBe(-2);
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: 70 })).toBe(10);
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: 60 })).toBe(0);
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: null })).toBeNull();
    component.classeA1 = '710';
    expect(component.sogliaVisibile).toBeNull();
    expect(component.deltaRicarico(articolo)).toBeNull();
  });

  it('arrotonda il delta visualizzato senza mostrare decimali o zero negativo', () => {
    service.cerca.and.returnValue(risultato([articolo], 60));
    component.cerca();
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: 84.98 })).toBe(25);
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: 35.02 })).toBe(-25);
    expect(component.deltaRicarico({ ...articolo, ricaricoAttuale: 59.98 })).toBe(0);
    expect(component.ricaricoImpostato).toBe(60);
  });

  it('conta tutto il risultato usando lo stesso delta arrotondato e separa i non confrontabili', () => {
    const righe: PrezzoArticolo[] = Array.from({ length: 51 }, (_, i) => ({ ...articolo, articolo: `LUX${i}`, ricaricoAttuale: 70 }));
    righe.push({ ...articolo, articolo: 'sotto', ricaricoAttuale: 58 });
    righe.push({ ...articolo, articolo: 'pari', ricaricoAttuale: 59.98 });
    righe.push({ ...articolo, articolo: 'assente', ricaricoAttuale: null });
    service.cerca.and.returnValue(risultato(righe, 60));
    component.cerca();
    expect(component.conteggiSoglia).toEqual({ sotto: 1, sopra: 51, pari: 1, nonConfrontabili: 1 });
    component.ricaricoImpostato = 70;
    expect(component.conteggiSoglia).toEqual({ sotto: 2, sopra: 0, pari: 51, nonConfrontabili: 1 });
    component.ricaricoImpostato = null;
    expect(component.conteggiSoglia).toBeNull();
  });

  it('Porta a soglia propone la conferma solo per i deselezionati sotto soglia', () => {
    const secondo = { ...articolo, articolo: 'LUX2', ricaricoAttuale: 40 };
    const sopra = { ...articolo, articolo: 'LUX3', ricaricoAttuale: 70 };
    const pari = { ...articolo, articolo: 'LUX4', ricaricoAttuale: 59.98 };
    const bloccato = { ...articolo, articolo: 'LUX5', aggiornabile: false };
    service.cerca.and.returnValue(risultato([articolo, secondo, sopra, pari, bloccato], 60));
    component.cerca();
    expect(component.puoPortareASoglia).toBeTrue();
    component.preparaPortaASoglia();
    expect(service.cerca).toHaveBeenCalledWith('414', 60, false);
    expect(component.portaASoglia).toBeTrue();
    expect(component.dataSource.data).toEqual([articolo, secondo, bloccato]);
    expect(component.selezionati).toEqual([articolo, secondo]);
    component.selezionaArticolo(secondo);
    component.selezionaArticolo(sopra);
    expect(component.selezionati).toEqual([articolo]);
    sceltaDeselezionati({ applica: false });
    component.applica();
    expect(dialog.open.calls.mostRecent().args[0]).toBe(RicaricoDeselezionatiDialogComponent);
    expect(dialog.open.calls.mostRecent().args[1]?.data).toEqual({
      articoli: [secondo], percentualePrincipale: 60, numeroSelezionati: 1
    });
    expect(service.aggiorna).toHaveBeenCalledOnceWith({
      classeA1: '414', percentuale: 60, ricaricoImpostato: 60, includiBloccati: false,
      articoli: [articolo], portaASoglia: true
    });
    expect(service.salvaSoglia).not.toHaveBeenCalled();
    expect(component.portaASoglia).toBeFalse();
  });

  it('Porta a soglia invia il ricarico alternativo scelto per i deselezionati', () => {
    const secondo = { ...articolo, articolo: 'LUX2', ricaricoAttuale: 40 };
    service.cerca.and.returnValue(risultato([articolo, secondo], 60));
    component.cerca();
    component.preparaPortaASoglia();
    component.selezionaArticolo(secondo);
    sceltaDeselezionati({ applica: true, percentuale: 30 });
    component.applica();
    expect(service.aggiorna).toHaveBeenCalledOnceWith({
      classeA1: '414', percentuale: 60, ricaricoImpostato: 60, includiBloccati: false,
      articoli: [articolo], portaASoglia: true,
      percentualeDeselezionati: 30, articoliDeselezionati: [secondo]
    });
  });

  it('Porta a soglia annulla entrambi i gruppi chiudendo la conferma dei deselezionati', () => {
    const secondo = { ...articolo, articolo: 'LUX2' };
    service.cerca.and.returnValue(risultato([articolo, secondo], 60));
    component.cerca();
    component.preparaPortaASoglia();
    component.selezionaArticolo(secondo);
    sceltaDeselezionati(undefined);
    component.applica();
    expect(service.aggiorna).not.toHaveBeenCalled();
    expect(component.confermaAperta).toBeFalse();
  });

  it('Mostra tutti conserva anteprima, selezioni ed esclusioni della modalità soglia', () => {
    const secondo = { ...articolo, articolo: 'LUX2', ricaricoAttuale: 40 };
    const sopra = { ...articolo, articolo: 'LUX3', ricaricoAttuale: 70 };
    service.cerca.and.returnValue(risultato([articolo, secondo, sopra], 60));
    component.cerca();
    component.preparaPortaASoglia();
    component.selezionaArticolo(secondo);
    service.cerca.calls.reset();
    component.mostraTutti();
    expect(component.dataSource.data).toEqual([articolo, secondo, sopra]);
    expect(component.portaASoglia).toBeTrue();
    expect(component.percentualeAnteprima).toBe(60);
    expect(component.selezionati).toEqual([articolo]);
    expect(component.puoApplicare).toBeTrue();
    component.selezionaArticolo(sopra);
    expect(component.selezionati).toEqual([articolo]);
    sceltaDeselezionati({ applica: false });
    component.applica();
    expect(dialog.open.calls.mostRecent().args[1]?.data).toEqual({
      articoli: [secondo], percentualePrincipale: 60, numeroSelezionati: 1
    });
    expect(service.aggiorna).toHaveBeenCalledOnceWith({
      classeA1: '414', percentuale: 60, ricaricoImpostato: 60, includiBloccati: false,
      articoli: [articolo], portaASoglia: true
    });
  });

  it('ordina i sopra soglia per delta decrescente nella lista completa e filtrata', () => {
    const basso = { ...articolo, articolo: 'basso', ricaricoAttuale: 65 };
    const alto = { ...articolo, articolo: 'alto', ricaricoAttuale: 90, aggiornabile: false };
    const medio = { ...articolo, articolo: 'medio', ricaricoAttuale: 75 };
    const pari = { ...articolo, articolo: 'pari', ricaricoAttuale: 60 };
    service.cerca.and.returnValue(risultato([pari, basso, alto, articolo, medio], 60));
    component.cerca();
    expect(component.dataSource.data).toEqual([articolo, alto, medio, basso, pari]);
    component.filtraSoglia('sopra');
    expect(component.dataSource.data).toEqual([alto, medio, basso]);
    component.mostraTutti();
    expect(component.dataSource.data).toEqual([articolo, alto, medio, basso, pari]);
  });

  it('ordina prima tutti i sotto soglia e filtra senza alterare conteggi o selezioni', () => {
    const sopra = { ...articolo, articolo: 'sopra', ricaricoAttuale: 70 };
    const pari = { ...articolo, articolo: 'pari', ricaricoAttuale: 59.98 };
    const bloccato = { ...articolo, articolo: 'bloccato', aggiornabile: false };
    const assente = { ...articolo, articolo: 'assente', ricaricoAttuale: null };
    service.cerca.and.returnValue(risultato([sopra, pari, bloccato, articolo, assente], 60));
    component.cerca(true);
    expect(component.dataSource.data).toEqual([articolo, bloccato, sopra, pari, assente]);
    const selezionati = component.selezionati;
    const conteggi = component.conteggiSoglia;
    component.filtraSoglia('sotto');
    expect(component.dataSource.data).toEqual([articolo, bloccato]);
    component.filtraSoglia('sopra');
    expect(component.dataSource.data).toEqual([sopra]);
    component.filtraSoglia('pari');
    expect(component.dataSource.data).toEqual([pari]);
    expect(component.conteggiSoglia).toEqual(conteggi);
    expect(component.selezionati).toEqual(selezionati);
    component.filtraSoglia('pari');
    expect(component.filtroSoglia).toBeNull();
    expect(component.dataSource.data.length).toBe(5);
    component.filtraSoglia('sotto');
    component.mostraTutti();
    expect(component.dataSource.data.length).toBe(5);
    expect(component.selezionati).toEqual(selezionati);
  });

  it('Porta a soglia non è disponibile senza soglia o senza candidati e rileva una soglia cambiata', () => {
    component.cerca();
    expect(component.puoPortareASoglia).toBeFalse();
    service.cerca.and.returnValue(risultato([{ ...articolo, ricaricoAttuale: 70 }], 60));
    component.cerca();
    expect(component.puoPortareASoglia).toBeFalse();
    service.cerca.and.returnValue(risultato([articolo], 60));
    component.cerca();
    service.cerca.and.returnValue(risultato([articolo], 65));
    component.preparaPortaASoglia();
    expect(component.puoApplicare).toBeFalse();
    expect(component.errore).toContain('La soglia è cambiata');
  });

  it('gestisce soglia zero e invia lo snapshot della soglia salvata', () => {
    service.cerca.and.returnValue(risultato([articolo], 0));
    component.cerca(true);
    expect(component.sogliaVisibile).toBe(0);
    expect(component.deltaRicarico(articolo)).toBe(30);
    conferma(true);
    component.applica();
    expect(service.aggiorna.calls.mostRecent().args[0].ricaricoImpostato).toBe(0);
  });

  it('salva la soglia separatamente e aggiorna il delta solo dopo il successo', () => {
    service.cerca.and.returnValue(risultato([articolo], 60));
    component.cerca();
    component.sogliaDaSalvare = 40;
    expect(component.sogliaVisibile).toBe(60);
    expect(component.deltaRicarico(articolo)).toBe(-30);
    expect(component.puoSalvareSoglia).toBeTrue();
    service.salvaSoglia.and.returnValue(of({ msg: 'Soglia salvata', error: false }));
    component.salvaSoglia();
    expect(service.salvaSoglia).toHaveBeenCalledOnceWith('414', 40, 60);
    expect(service.aggiorna).not.toHaveBeenCalled();
    expect(component.sogliaVisibile).toBe(40);
    expect(component.deltaRicarico(articolo)).toBe(-10);
    expect(component.articoli[0].prezzoBase).toBe(130);
    expect(component.puoSalvareSoglia).toBeFalse();
  });

  it('permette la prima soglia zero e rifiuta valori non validi o fornitori non caricati', () => {
    component.cerca();
    component.sogliaDaSalvare = 0;
    expect(component.puoSalvareSoglia).toBeTrue();
    component.sogliaDaSalvare = -1;
    expect(component.puoSalvareSoglia).toBeFalse();
    component.sogliaDaSalvare = 0.12345;
    expect(component.puoSalvareSoglia).toBeFalse();
    component.sogliaDaSalvare = 60;
    component.classeA1 = '710';
    expect(component.puoSalvareSoglia).toBeFalse();
    component.salvaSoglia();
    expect(service.salvaSoglia).not.toHaveBeenCalled();
  });

  it('mantiene la soglia salvata se il salvataggio fallisce', () => {
    service.cerca.and.returnValue(risultato([articolo], 60));
    component.cerca(true);
    component.sogliaDaSalvare = 70;
    service.salvaSoglia.and.returnValue(throwError(() => ({ status: 409, error: { msg: 'Soglia cambiata' } })));
    component.salvaSoglia();
    expect(component.sogliaVisibile).toBe(60);
    expect(component.errore).toBe('Soglia cambiata');
    expect(component.puoApplicare).toBeFalse();
  });

  function conferma(esito: boolean): void {
    dialog.open.and.returnValue({ afterClosed: () => of(esito) } as MatDialogRef<ConfirmDialogComponent>);
  }

  function sceltaDeselezionati(esito: RicaricoDeselezionatiResult | undefined): void {
    dialog.open.and.returnValue({ afterClosed: () => of(esito) } as MatDialogRef<RicaricoDeselezionatiDialogComponent>);
  }

  it('filtra autocomplete per nome o codice senza accettare testo libero come selezione', () => {
    component.classeA1 = 'lux';
    expect(component.classiFornitoreFiltrate.map(c => c.codice)).toEqual(['414']);
    expect(component.classeA1Valido).toBeFalse();
    component.classeA1 = '71';
    expect(component.classiFornitoreFiltrate.map(c => c.codice)).toEqual(['710']);
    component.classeA1 = '710';
    expect(component.classeA1Valido).toBeTrue();
    expect(component.mostraFornitore('710')).toBe('710 — PAFFONI');
    component.classeA1 = '';
    expect(component.classiFornitoreFiltrate.length).toBe(2);
  });

  it('carica le classificazioni TCA1 e accetta solo un fornitore della lista', () => {
    service.classiFornitore.and.returnValue(of([{ codice: '414', descrizione: 'LUXOR' }]));
    component.ngOnInit();
    expect(service.classiFornitore).toHaveBeenCalledTimes(1);
    expect(component.classeA1Valido).toBeTrue();
    component.classeA1 = '999';
    expect(component.classeA1Valido).toBeFalse();
    component.cerca();
    expect(service.cerca).not.toHaveBeenCalled();
  });

  it('richiede anteprima valida e la invalida se cambiano percentuale o filtri', () => {
    component.cerca();
    expect(component.puoApplicare).toBeFalse();
    component.cerca(true);
    expect(component.puoApplicare).toBeTrue();
    component.percentuale = 48;
    expect(component.puoApplicare).toBeFalse();
    component.percentuale = 45;
    component.classeA1 = '710';
    expect(component.puoApplicare).toBeFalse();
    component.classeA1 = '414';
    component.includiBloccati = true;
    expect(component.puoApplicare).toBeFalse();
  });

  it('invia solo gli articoli aggiornabili del risultato completo dopo conferma', () => {
    component.cerca(true);
    conferma(true);
    component.applica();
    expect(service.aggiorna).toHaveBeenCalledOnceWith({
      classeA1: '414', percentuale: 45, ricaricoImpostato: null, includiBloccati: false, articoli: [articolo]
    });
  });

  for (const portaASoglia of [false, true]) {
    it(`dopo il salvataggio ${portaASoglia ? 'a soglia' : 'del ricavo'} ricarica senza riaprire l’anteprima`, () => {
      service.cerca.and.returnValue(risultato([articolo], 60));
      component.cerca();
      if (portaASoglia) component.preparaPortaASoglia();
      else component.cerca(true);
      conferma(true);
      component.applica();
      expect(service.aggiorna).toHaveBeenCalledTimes(1);
      expect(service.cerca.calls.mostRecent().args).toEqual(['414', null, false]);
      expect(component.percentuale).toBeNull();
      expect(component.percentualeAnteprima).toBeNull();
      expect(component.portaASoglia).toBeFalse();
      expect(component.selection.isEmpty()).toBeTrue();
      expect(component.puoApplicare).toBeFalse();
      component.applica();
      expect(service.aggiorna).toHaveBeenCalledTimes(1);
    });
  }

  it('non aggiorna se si annulla la conferma', () => {
    component.cerca(true);
    conferma(false);
    component.applica();
    expect(service.aggiorna).not.toHaveBeenCalled();
  });

  it('seleziona di default solo gli aggiornabili dopo l’anteprima e azzera la selezione alla ricerca', () => {
    component.cerca();
    expect(component.selezionati.length).toBe(0);
    component.cerca(true);
    expect(component.selezionati).toEqual([articolo]);
    component.cerca();
    expect(component.selezionati.length).toBe(0);
    expect(component.puoApplicare).toBeFalse();
  });

  it('esclude dalla richiesta gli articoli deselezionati dall’utente', () => {
    const secondo = { ...articolo, articolo: 'LUX000001' };
    service.cerca.and.returnValue(risultato([articolo, secondo]));
    component.cerca(true);
    component.selezionaArticolo(secondo);
    sceltaDeselezionati({ applica: false });
    component.applica();
    expect(service.aggiorna).toHaveBeenCalledOnceWith({
      classeA1: '414', percentuale: 45, ricaricoImpostato: null, includiBloccati: false, articoli: [articolo]
    });
    expect(dialog.open.calls.mostRecent().args[0]).toBe(RicaricoDeselezionatiDialogComponent);
  });

  it('invia due gruppi distinti se viene scelto un ricarico per i deselezionati', () => {
    const secondo = { ...articolo, articolo: 'LUX000001' };
    service.cerca.and.returnValue(risultato([articolo, secondo]));
    component.cerca(true);
    component.selezionaArticolo(secondo);
    sceltaDeselezionati({ applica: true, percentuale: 30 });
    component.applica();
    expect(service.aggiorna).toHaveBeenCalledOnceWith({
      classeA1: '414', percentuale: 45, ricaricoImpostato: null, includiBloccati: false, articoli: [articolo],
      percentualeDeselezionati: 30, articoliDeselezionati: [secondo]
    });
  });

  it('annullando la popup non applica nessuna delle due percentuali', () => {
    const secondo = { ...articolo, articolo: 'LUX000001' };
    service.cerca.and.returnValue(risultato([articolo, secondo]));
    component.cerca(true);
    component.selezionaArticolo(secondo);
    sceltaDeselezionati(undefined);
    component.applica();
    expect(service.aggiorna).not.toHaveBeenCalled();
    expect(component.confermaAperta).toBeFalse();
  });

  it('seleziona e deseleziona tutto il risultato, anche oltre la prima pagina', () => {
    const righe = Array.from({ length: 51 }, (_, i) => ({ ...articolo, articolo: `414${i}` }));
    service.cerca.and.returnValue(risultato(righe));
    component.cerca(true);
    expect(component.selezionati.length).toBe(51);
    component.selezionaArticolo(righe[50]);
    expect(component.selezionati.length).toBe(50);
    component.selezionaTutti();
    expect(component.selezionati.length).toBe(51);
    component.selezionaTutti();
    expect(component.selezionati.length).toBe(0);
    expect(component.puoApplicare).toBeFalse();
    component.applica();
    expect(service.aggiorna).not.toHaveBeenCalled();
  });

  it('impedisce un nuovo invio dopo un conflitto finché non si ricalcola', () => {
    component.cerca(true);
    conferma(true);
    service.aggiorna.and.returnValue(throwError(() => ({ status: 409, error: { msg: 'Dati cambiati' } })));
    component.applica();
    expect(component.errore).toBe('Dati cambiati');
    expect(component.puoApplicare).toBeFalse();
  });

  it('rifiuta prefissi jolly e percentuali non valide senza chiamare il server', () => {
    component.classeA1 = '4%_';
    component.cerca(true);
    expect(service.cerca).not.toHaveBeenCalled();
    component.classeA1 = '414';
    component.percentuale = -1;
    component.cerca(true);
    expect(service.cerca).not.toHaveBeenCalled();
  });

  it('usa il permesso dedicato senza dipendere dal ruolo', () => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', ['hasPerm', 'hasRole']);
    const perm = new PermissionService(auth);
    auth.hasRole.and.returnValue(true);
    auth.hasPerm.and.returnValue(false);
    expect(perm.canGestisciPrezziArticoli).toBeFalse();
    auth.hasPerm.and.returnValue(true);
    auth.hasRole.and.returnValue(false);
    expect(perm.canGestisciPrezziArticoli).toBeTrue();
    expect(auth.hasPerm).toHaveBeenCalledWith('prezzi_articoli.view');
    expect(auth.hasRole).not.toHaveBeenCalled();
  });
});

describe('RicaricoDeselezionatiDialogComponent', () => {
  let component: RicaricoDeselezionatiDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<RicaricoDeselezionatiDialogComponent, RicaricoDeselezionatiResult>>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    component = new RicaricoDeselezionatiDialogComponent({
      articoli: [], percentualePrincipale: 45, numeroSelezionati: 10
    }, dialogRef);
  });

  it('rifiutando il secondo ricarico conferma solo il primo gruppo', () => {
    component.soloSelezionati();
    expect(dialogRef.close).toHaveBeenCalledOnceWith({ applica: false });
  });

  it('non accetta un secondo ricarico mancante o negativo', () => {
    component.applicaAncheDeselezionati();
    component.percentuale = -1;
    component.applicaAncheDeselezionati();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('conferma la seconda percentuale, incluso un ricarico zero', () => {
    component.percentuale = 0;
    component.applicaAncheDeselezionati();
    expect(dialogRef.close).toHaveBeenCalledOnceWith({ applica: true, percentuale: 0 });
  });
});

describe('StoricoPrezziDialogComponent', () => {
  let component: StoricoPrezziDialogComponent;
  let service: jasmine.SpyObj<PrezziArticoliService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('PrezziArticoliService', ['storico']);
    component = new StoricoPrezziDialogComponent({ articolo: '414', descrizione: 'Articolo' }, service);
  });

  afterEach(() => component.ngOnDestroy());

  it('carica le modifiche del codice richiesto e gestisce la cronologia vuota', () => {
    service.storico.and.returnValue(of([]));
    component.ngOnInit();
    expect(service.storico).toHaveBeenCalledOnceWith('414');
    expect(component.caricamento).toBeFalse();
    expect(component.storico).toEqual([]);
    expect(component.errore).toBe('');
  });

  it('mantiene l’ordine delle modifiche restituito dal server', () => {
    const storico = [{ dataModifica: '2026-10-26T10:00:00', prezzoPrecedente: 100, prezzoBase: 160, utente: 'TEST' }];
    service.storico.and.returnValue(of(storico));
    component.ngOnInit();
    expect(component.storico).toEqual(storico);
  });

  it('mostra un errore se la lettura fallisce', () => {
    service.storico.and.returnValue(throwError(() => ({ error: { msg: 'Cronologia non disponibile' } })));
    component.ngOnInit();
    expect(component.caricamento).toBeFalse();
    expect(component.errore).toBe('Cronologia non disponibile');
  });
});
