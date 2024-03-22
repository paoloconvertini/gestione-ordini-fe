import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdiniClientiPregressiDialogComponent } from './ordini-clienti-pregressi-dialog.component';

describe('OrdiniClientiPregressiDialogComponent', () => {
  let component: OrdiniClientiPregressiDialogComponent;
  let fixture: ComponentFixture<OrdiniClientiPregressiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdiniClientiPregressiDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdiniClientiPregressiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
