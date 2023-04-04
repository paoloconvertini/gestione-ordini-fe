import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OafDettaglioComponent } from './oaf-dettaglio.component';

describe('OafDettaglioComponent', () => {
  let component: OafDettaglioComponent;
  let fixture: ComponentFixture<OafDettaglioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OafDettaglioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OafDettaglioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
