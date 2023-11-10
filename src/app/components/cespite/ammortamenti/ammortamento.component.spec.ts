import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmmortamentoComponent } from './ammortamento.component';

describe('CespiteComponent', () => {
  let component: AmmortamentoComponent;
  let fixture: ComponentFixture<AmmortamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmmortamentoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmmortamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
