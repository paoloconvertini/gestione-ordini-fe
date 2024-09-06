import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggiornaDataConsegnaDialogComponent } from './aggiorna-data-consegna-dialog.component';

describe('AggiornaDataConsegnaDialogComponent', () => {
  let component: AggiornaDataConsegnaDialogComponent;
  let fixture: ComponentFixture<AggiornaDataConsegnaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AggiornaDataConsegnaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AggiornaDataConsegnaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
