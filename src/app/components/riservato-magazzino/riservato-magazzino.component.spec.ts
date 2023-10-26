import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiservatoMagazzinoComponent } from './riservato-magazzino.component';

describe('RiservatoMagazzinoComponent', () => {
  let component: RiservatoMagazzinoComponent;
  let fixture: ComponentFixture<RiservatoMagazzinoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiservatoMagazzinoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiservatoMagazzinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
