import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneConsegneComponent } from './gestione-consegne.component';

describe('ListaComponent', () => {
  let component: GestioneConsegneComponent;
  let fixture: ComponentFixture<GestioneConsegneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestioneConsegneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestioneConsegneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
