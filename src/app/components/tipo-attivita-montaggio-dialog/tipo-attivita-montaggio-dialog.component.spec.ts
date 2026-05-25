import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoAttivitaMontaggioDialogComponent } from './tipo-attivita-montaggio-dialog.component';

describe('TipoAttivitaMontaggioDialogComponent', () => {
  let component: TipoAttivitaMontaggioDialogComponent;
  let fixture: ComponentFixture<TipoAttivitaMontaggioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoAttivitaMontaggioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoAttivitaMontaggioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
