import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaAppuntamentiComponent } from './agenda-appuntamenti.component';

describe('AgendaAppuntamentiComponent', () => {
  let component: AgendaAppuntamentiComponent;
  let fixture: ComponentFixture<AgendaAppuntamentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgendaAppuntamentiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaAppuntamentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
