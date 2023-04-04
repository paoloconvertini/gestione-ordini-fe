import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OafListComponent } from './oaf-list.component';

describe('OafListComponent', () => {
  let component: OafListComponent;
  let fixture: ComponentFixture<OafListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OafListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OafListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
