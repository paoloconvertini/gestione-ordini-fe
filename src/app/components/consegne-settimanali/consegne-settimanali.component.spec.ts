import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsegneSettimanaliComponent } from './consegne-settimanali.component';

describe('ConsegneSettimanaliComponent', () => {
  let component: ConsegneSettimanaliComponent;
  let fixture: ComponentFixture<ConsegneSettimanaliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsegneSettimanaliComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsegneSettimanaliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
