import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CespiteComponent } from './cespite.component';

describe('CespiteComponent', () => {
  let component: CespiteComponent;
  let fixture: ComponentFixture<CespiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CespiteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CespiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
