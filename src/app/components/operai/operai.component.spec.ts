import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperaiComponent } from './operai.component';

describe('OperaiComponent', () => {
  let component: OperaiComponent;
  let fixture: ComponentFixture<OperaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperaiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
