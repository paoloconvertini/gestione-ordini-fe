import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollegaOAFComponent } from './collega-oaf.component';

describe('CollegaOAFDialogComponent', () => {
  let component: CollegaOAFComponent;
  let fixture: ComponentFixture<CollegaOAFComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollegaOAFComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollegaOAFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
