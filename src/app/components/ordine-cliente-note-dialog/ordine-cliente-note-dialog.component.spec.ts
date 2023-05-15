import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdineClienteNoteDialogComponent } from './ordine-cliente-note-dialog.component';

describe('OrdineClienteNoteDialogComponent', () => {
  let component: OrdineClienteNoteDialogComponent;
  let fixture: ComponentFixture<OrdineClienteNoteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdineClienteNoteDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdineClienteNoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
