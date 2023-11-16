import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipocespiteDialogComponent } from './tipocespite-dialog.component';

describe('TipocespiteDialogComponent', () => {
  let component: TipocespiteDialogComponent;
  let fixture: ComponentFixture<TipocespiteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipocespiteDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipocespiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
