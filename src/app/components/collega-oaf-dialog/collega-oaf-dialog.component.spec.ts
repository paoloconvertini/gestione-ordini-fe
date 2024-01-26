import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollegaOAFDialogComponent } from './collega-oaf-dialog.component';

describe('CollegaOAFDialogComponent', () => {
  let component: CollegaOAFDialogComponent;
  let fixture: ComponentFixture<CollegaOAFDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollegaOAFDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollegaOAFDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
