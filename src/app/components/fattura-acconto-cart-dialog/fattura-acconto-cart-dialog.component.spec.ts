import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FatturaAccontoCartDialogComponent } from './fattura-acconto-cart-dialog.component';

describe('FatturaAccontoCartDialogComponent', () => {
  let component: FatturaAccontoCartDialogComponent;
  let fixture: ComponentFixture<FatturaAccontoCartDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FatturaAccontoCartDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FatturaAccontoCartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
