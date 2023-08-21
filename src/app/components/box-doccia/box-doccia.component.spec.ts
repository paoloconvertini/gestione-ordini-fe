import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxDocciaComponent } from './box-doccia.component';

describe('BoxDocciaComponent', () => {
  let component: BoxDocciaComponent;
  let fixture: ComponentFixture<BoxDocciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxDocciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxDocciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
