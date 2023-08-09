import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaBollaComponent } from './lista-bolla.component';

describe('ListaBollaComponent', () => {
  let component: ListaBollaComponent;
  let fixture: ComponentFixture<ListaBollaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaBollaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaBollaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
