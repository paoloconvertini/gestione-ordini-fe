import { AppuntamentoDialogComponent } from './appuntamento-dialog.component';

describe('AppuntamentoDialogComponent: partecipanti formazione', () => {
  let component: AppuntamentoDialogComponent;

  beforeEach(() => {
    component = new AppuntamentoDialogComponent({}, {} as any, {} as any,
      {} as any, {} as any, {} as any);
    component.dto = {
      tipoEvento: 'FORMAZIONE', sedeId: 1, dataAppuntamento: new Date(),
      oraDa: '09:00', oraA: '10:00', codVenditori: []
    };
  });

  it('accetta una formazione con soli nomi liberi', () => {
    component.dto.altriPartecipanti = 'Mario Rossi\nAnna Bianchi';
    expect(component.isValid()).toBeTrue();
  });

  it('accetta venditori e nomi liberi insieme', () => {
    component.dto.codVenditori = ['901'];
    component.dto.altriPartecipanti = 'Mario Rossi';
    expect(component.isValid()).toBeTrue();
  });

  it('accetta una formazione con soli venditori', () => {
    component.dto.codVenditori = ['901'];
    expect(component.isValid()).toBeTrue();
  });

  it('rifiuta una formazione senza partecipanti o con soli spazi', () => {
    expect(component.isValid()).toBeFalse();
    component.dto.altriPartecipanti = '  \n  ';
    expect(component.isValid()).toBeFalse();
  });

  for (const tipoEvento of ['APPUNTAMENTO', 'VISITA']) {
    it('richiede il venditore per ' + tipoEvento, () => {
      component.dto.tipoEvento = tipoEvento;
      component.dto.nomeCliente = 'Cliente';
      component.dto.motivoId = 1;
      component.dto.altriPartecipanti = 'Mario Rossi';
      expect(component.isValid()).toBeFalse();
      component.dto.codVenditori = ['901'];
      expect(component.isValid()).toBeTrue();
    });
  }
});
