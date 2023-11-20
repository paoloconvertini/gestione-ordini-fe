import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoCespiteListComponent } from './tipo-cespite-list.component';

describe('TipoCespiteListComponent', () => {
  let component: TipoCespiteListComponent;
  let fixture: ComponentFixture<TipoCespiteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoCespiteListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoCespiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
