import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaConsegnaDialogComponent } from './nota-consegna-dialog.component';

describe('NotaConsegnaDialogComponent', () => {
  let component: NotaConsegnaDialogComponent;
  let fixture: ComponentFixture<NotaConsegnaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotaConsegnaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotaConsegnaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
