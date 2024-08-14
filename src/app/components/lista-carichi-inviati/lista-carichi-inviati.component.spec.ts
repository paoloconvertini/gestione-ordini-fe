import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCarichiInviatiComponent } from './lista-carichi-inviati.component';

describe('ListaCarichiInviatiComponent', () => {
  let component: ListaCarichiInviatiComponent;
  let fixture: ComponentFixture<ListaCarichiInviatiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaCarichiInviatiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCarichiInviatiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
