import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsegneSettimanaliDettaglioDialogComponent } from './consegne-settimanali-dettaglio-dialog.component';

describe('ConsegneSettimanaliDettaglioDialogComponent', () => {
  let component: ConsegneSettimanaliDettaglioDialogComponent;
  let fixture: ComponentFixture<ConsegneSettimanaliDettaglioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsegneSettimanaliDettaglioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsegneSettimanaliDettaglioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
