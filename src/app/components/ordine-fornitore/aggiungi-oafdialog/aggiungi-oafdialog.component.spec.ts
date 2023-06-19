import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggiungiOAFDialogComponent } from './aggiungi-oafdialog.component';

describe('AggiungiOAFDialogComponent', () => {
  let component: AggiungiOAFDialogComponent;
  let fixture: ComponentFixture<AggiungiOAFDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AggiungiOAFDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AggiungiOAFDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
