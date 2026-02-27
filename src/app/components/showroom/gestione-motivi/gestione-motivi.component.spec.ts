import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneMotiviComponent } from './gestione-motivi.component';

describe('GestioneMotiviComponent', () => {
  let component: GestioneMotiviComponent;
  let fixture: ComponentFixture<GestioneMotiviComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestioneMotiviComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestioneMotiviComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
