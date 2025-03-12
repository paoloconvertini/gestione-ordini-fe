import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FatturaAccontoDialogComponent } from './fattura-acconto-dialog.component';

describe('FatturaAccontoDialogComponent', () => {
  let component: FatturaAccontoDialogComponent;
  let fixture: ComponentFixture<FatturaAccontoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FatturaAccontoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FatturaAccontoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
