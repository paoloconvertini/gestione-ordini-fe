import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociaClienteDialogComponent } from './associa-cliente-dialog.component';

describe('AssociaClienteDialogComponent', () => {
  let component: AssociaClienteDialogComponent;
  let fixture: ComponentFixture<AssociaClienteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociaClienteDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociaClienteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
