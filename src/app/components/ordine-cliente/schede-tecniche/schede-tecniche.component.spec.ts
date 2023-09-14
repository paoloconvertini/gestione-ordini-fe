import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedeTecnicheComponent } from './schede-tecniche.component';

describe('SchedeTecnicheComponent', () => {
  let component: SchedeTecnicheComponent;
  let fixture: ComponentFixture<SchedeTecnicheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchedeTecnicheComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedeTecnicheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
