import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttivitaMontaggioComponent } from './attivita-montaggio.component';

describe('AttivitaMontaggioComponent', () => {
  let component: AttivitaMontaggioComponent;
  let fixture: ComponentFixture<AttivitaMontaggioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttivitaMontaggioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttivitaMontaggioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
