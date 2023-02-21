import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmaDialogComponent } from './firma-dialog.component';

describe('FirmaDialogComponent', () => {
  let component: FirmaDialogComponent;
  let fixture: ComponentFixture<FirmaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirmaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
