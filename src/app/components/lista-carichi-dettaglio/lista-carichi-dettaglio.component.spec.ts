import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCarichiDettaglioComponent } from './lista-carichi-dettaglio.component';

describe('ListaCarichiDettaglioComponent', () => {
  let component: ListaCarichiDettaglioComponent;
  let fixture: ComponentFixture<ListaCarichiDettaglioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaCarichiDettaglioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCarichiDettaglioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
