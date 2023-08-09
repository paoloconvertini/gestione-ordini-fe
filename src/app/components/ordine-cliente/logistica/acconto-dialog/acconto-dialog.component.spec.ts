import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccontoDialogComponent } from './acconto-dialog.component';

describe('AccontoDialogComponent', () => {
  let component: AccontoDialogComponent;
  let fixture: ComponentFixture<AccontoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccontoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccontoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
