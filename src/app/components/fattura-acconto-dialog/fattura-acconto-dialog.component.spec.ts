import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {MatBadgeModule} from '@angular/material/badge';
import {MatSnackBar} from '@angular/material/snack-bar';
import {of} from 'rxjs';
import {FatturaAccontoDialogComponent} from './fattura-acconto-dialog.component';
import {OrdineClienteService} from '../../services/ordine-cliente/list/ordine-cliente.service';

describe('FatturaAccontoDialogComponent', () => {
  let fixture: ComponentFixture<FatturaAccontoDialogComponent>;
  let component: FatturaAccontoDialogComponent;
  let iva: any;
  let ordine: any;
  let dialog: any;
  beforeEach(async () => {
    iva = {fcodiceIva: 22, importo: 1000, importoIvato: 1220, importoResiduo: 1000,
      importoResiduoIvato: 1220, residuoAcconti: 0, residuoAccontiIvato: 0,
      residuoFatturabile: 1000, residuoFatturabileIvato: 1220};
    ordine = {anno: 2026, serie: '11', progressivo: 10, fatturaAccontoIvaViewList: [iva]};
    dialog = jasmine.createSpyObj('dialog', ['open']);
    dialog.open.and.returnValue({afterClosed: () => of(null)});
    await TestBed.configureTestingModule({
      declarations: [FatturaAccontoDialogComponent],
      imports: [CommonModule, FormsModule, NoopAnimationsModule, MatDialogModule, MatButtonModule,
        MatIconModule, MatTooltipModule, MatTabsModule, MatCheckboxModule, MatInputModule, MatSliderModule, MatBadgeModule],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {ordini: [ordine], intestazione: 'Cliente test', sottoConto: '001'}},
        {provide: OrdineClienteService, useValue: {getAccontiNonValidatiCount: () => of(0)}},
        {provide: MatDialogRef, useValue: {close: jasmine.createSpy('close')}},
        {provide: MatSnackBar, useValue: {open: jasmine.createSpy('snack')}}, {provide: MatDialog, useValue: dialog}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FatturaAccontoDialogComponent); component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  it('mantiene il collegamento tra input importo, imponibile e percentuale', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[inputmode="decimal"]');
    input.value = '122,00'; input.dispatchEvent(new Event('input')); input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(iva.nuovoAccontoIvato).toBe(122); expect(iva.nuovoAcconto).toBe(100); expect(iva.percentuale).toBe(10);
  });
  it('mantiene A saldo e il blocco degli acconti non validati', () => {
    iva.aSaldo = true; component.calcolaPercentuale(iva, true); fixture.detectChanges();
    expect(iva.nuovoAccontoIvato).toBe(1220);
    expect(fixture.nativeElement.querySelector('.importo-saldo').textContent).toContain('IVA inclusa');
    component.nonValidatiCountByKey[component.keyOrdine(ordine)] = 1; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.aggiungi-acconto').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('.avviso')).not.toBeNull();
  });
  it('aggiorna il badge e apre lo stesso carrello senza duplicare acconti', () => {
    iva.nuovoAccontoIvato = 122; iva.nuovoAcconto = 100;
    fixture.nativeElement.querySelector('.aggiungi-acconto').click(); fixture.detectChanges();
    component.aggiungi(iva, ordine); expect(component.acconti.length).toBe(1);
    expect(fixture.nativeElement.querySelector('.mat-badge-content').textContent.trim()).toBe('1');
    fixture.nativeElement.querySelector('.azioni-footer button:last-child').click();
    expect(dialog.open.calls.mostRecent().args[1].data.acconti).toBe(component.acconti);
  });
  it('non permette aggiunte con residuo fatturabile esaurito', () => {
    iva.residuoFatturabile = 0; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.aggiungi-acconto').disabled).toBeTrue();
  });
});
