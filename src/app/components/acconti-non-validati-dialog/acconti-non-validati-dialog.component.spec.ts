import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccontiNonValidatiDialogComponent } from './acconti-non-validati-dialog.component';

describe('AccontiNonValidatiDialogComponent', () => {
  let component: AccontiNonValidatiDialogComponent;
  let fixture: ComponentFixture<AccontiNonValidatiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccontiNonValidatiDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccontiNonValidatiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
