import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidoClienteComponent } from './fido-cliente.component';

describe('FidoClienteComponent', () => {
  let component: FidoClienteComponent;
  let fixture: ComponentFixture<FidoClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FidoClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FidoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
