import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OafMonitorComponent } from './oaf-monitor.component';

describe('OafMonitorComponent', () => {
  let component: OafMonitorComponent;
  let fixture: ComponentFixture<OafMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OafMonitorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OafMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
