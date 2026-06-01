import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppuntamentoDialogComponent } from './appuntamento-dialog.component';

describe('DialogAppuntamentoComponent', () => {
  let component: AppuntamentoDialogComponent;
  let fixture: ComponentFixture<AppuntamentoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppuntamentoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppuntamentoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
