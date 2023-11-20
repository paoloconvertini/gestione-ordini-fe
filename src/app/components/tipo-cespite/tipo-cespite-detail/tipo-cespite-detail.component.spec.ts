import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoCespiteDetailComponent } from './tipo-cespite-detail.component';

describe('TipoCespiteDetailComponent', () => {
  let component: TipoCespiteDetailComponent;
  let fixture: ComponentFixture<TipoCespiteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoCespiteDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoCespiteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
