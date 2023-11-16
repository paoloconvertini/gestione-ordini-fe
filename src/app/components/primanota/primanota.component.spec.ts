import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimanotaComponent } from './primanota.component';

describe('PrimanotaComponent', () => {
  let component: PrimanotaComponent;
  let fixture: ComponentFixture<PrimanotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrimanotaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimanotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
