import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdineClienteComponent } from './ordine-cliente.component';

describe('OrdineClienteComponent', () => {
  let component: OrdineClienteComponent;
  let fixture: ComponentFixture<OrdineClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdineClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdineClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
