import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsegnaEditDialogComponent } from './consegna-edit-dialog.component';

describe('ConsegnaEditDialogComponent', () => {
  let component: ConsegnaEditDialogComponent;
  let fixture: ComponentFixture<ConsegnaEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsegnaEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsegnaEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
