import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCarichiComponent } from './lista-carichi.component';

describe('ListaCarichiComponent', () => {
  let component: ListaCarichiComponent;
  let fixture: ComponentFixture<ListaCarichiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaCarichiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCarichiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
