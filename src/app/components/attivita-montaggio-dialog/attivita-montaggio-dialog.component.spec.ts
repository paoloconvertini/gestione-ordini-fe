import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttivitaMontaggioDialogComponent } from './attivita-montaggio-dialog.component';

describe('AttivitaMontaggioDialogComponent', () => {
  let component: AttivitaMontaggioDialogComponent;
  let fixture: ComponentFixture<AttivitaMontaggioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttivitaMontaggioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttivitaMontaggioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
