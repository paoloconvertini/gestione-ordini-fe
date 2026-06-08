import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssenzaDialogComponent } from './assenza-dialog.component';

describe('AssenzaDialogComponent', () => {
  let component: AssenzaDialogComponent;
  let fixture: ComponentFixture<AssenzaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssenzaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssenzaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
