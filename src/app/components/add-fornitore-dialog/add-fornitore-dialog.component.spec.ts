import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFornitoreDialogComponent } from './add-fornitore-dialog.component';

describe('AddFornitoreDialogComponent', () => {
  let component: AddFornitoreDialogComponent;
  let fixture: ComponentFixture<AddFornitoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddFornitoreDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFornitoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
