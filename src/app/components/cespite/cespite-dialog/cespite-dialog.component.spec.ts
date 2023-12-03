import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CespiteDialogComponent } from './cespite-dialog.component';

describe('CespiteDialogComponent', () => {
  let component: CespiteDialogComponent;
  let fixture: ComponentFixture<CespiteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CespiteDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CespiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
