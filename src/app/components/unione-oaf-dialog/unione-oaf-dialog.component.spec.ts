import {TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {UnioneOafDialogComponent} from './unione-oaf-dialog.component';

describe('UnioneOafDialogComponent', () => {
  it('mostra ordini e fornitori e richiede una conferma aggiuntiva per fornitori diversi', async () => {
    const ref = {close: jasmine.createSpy('close')};
    await TestBed.configureTestingModule({
      declarations: [UnioneOafDialogComponent],
      imports: [CommonModule, FormsModule, NoopAnimationsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatIconModule],
      providers: [{provide: MatDialogRef, useValue: ref}, {provide: MAT_DIALOG_DATA, useValue: {
        fornitoriDiversi: true, versione: 'v', ordini: [
          {anno: 2026, serie: 'A', progressivo: 1, gruppo: 321, conto: '001', intestazione: 'Tubes'},
          {anno: 2026, serie: 'B', progressivo: 2, gruppo: 321, conto: '002', intestazione: 'Atlas'}]
      }}]
    }).compileComponents();
    const fixture = TestBed.createComponent(UnioneOafDialogComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tubes'); expect(fixture.nativeElement.textContent).toContain('Atlas');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tr.supplier-warning').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tr.supplier-warning').textContent).toContain('Atlas');
    fixture.componentInstance.conferma(); expect(ref.close).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('input[type="checkbox"]').click(); fixture.detectChanges();
    fixture.nativeElement.querySelector('mat-dialog-actions button:last-child').click();
    expect(ref.close).toHaveBeenCalledWith(true); fixture.destroy();
  });
});
