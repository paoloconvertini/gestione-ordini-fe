import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipiAttivitaMontaggioComponent } from './tipi-attivita-montaggio.component';

describe('TipiAttivitaMontaggioComponent', () => {
  let component: TipiAttivitaMontaggioComponent;
  let fixture: ComponentFixture<TipiAttivitaMontaggioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipiAttivitaMontaggioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipiAttivitaMontaggioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
