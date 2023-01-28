import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrdineClienteComponent } from './add-ordine-cliente.component';

describe('AddOrdineClienteComponent', () => {
  let component: AddOrdineClienteComponent;
  let fixture: ComponentFixture<AddOrdineClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOrdineClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrdineClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
