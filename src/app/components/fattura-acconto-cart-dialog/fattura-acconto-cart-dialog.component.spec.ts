import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Component, Input} from '@angular/core';
import {FatturaAccontoCartDialogComponent} from './fattura-acconto-cart-dialog.component';

@Component({selector: 'app-fido-cliente', template: ''})
class FidoClienteStub {
  @Input() contoCliente: any;
  @Input() mostraSituazioneCliente: any;
}

describe('FatturaAccontoCartDialogComponent', () => {
  let fixture: ComponentFixture<FatturaAccontoCartDialogComponent>;
  let component: FatturaAccontoCartDialogComponent;
  let ref: any;
  beforeEach(async () => {
    ref = {close: jasmine.createSpy('close')};
    await TestBed.configureTestingModule({
      declarations: [FatturaAccontoCartDialogComponent, FidoClienteStub],
      imports: [CommonModule, NoopAnimationsModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
      providers: [{provide: MatDialogRef, useValue: ref}, {provide: MAT_DIALOG_DATA, useValue: {
        intestazione: 'Cliente test', sottoConto: '001', acconti: [
          {anno: 2026, serie: '11', progressivo: 10, iva: 22, nuovoAcconto: 100, nuovoAccontoIvato: 122},
          {anno: 2026, serie: '11', progressivo: 11, iva: 22, nuovoAcconto: 200, nuovoAccontoIvato: 244}]
      }}]
    }).compileComponents();
    fixture = TestBed.createComponent(FatturaAccontoCartDialogComponent); component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  it('mostra tutti i dati delle righe e aggiorna il totale dopo la rimozione', () => {
    expect(component.totaleIvato).toBe(366);
    expect(fixture.nativeElement.querySelectorAll('.acconto-selezionato').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('2026/11/10');
    fixture.nativeElement.querySelector('.rimuovi-acconto').click(); fixture.detectChanges();
    expect(component.acconti.length).toBe(1); expect(component.totaleIvato).toBe(244);
  });
  it('mantiene la conferma del carrello', () => {
    fixture.nativeElement.querySelector('.riepilogo-footer button:last-child').click();
    expect(ref.close).toHaveBeenCalledWith(true);
  });
  it('mostra lo stato vuoto dopo aver rimosso tutti gli acconti', () => {
    component.rimuovi(1); component.rimuovi(0); fixture.detectChanges();
    expect(component.totaleIvato).toBe(0); expect(fixture.nativeElement.querySelector('.vuoto')).not.toBeNull();
  });
});
