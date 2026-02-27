import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivoDialogComponent } from './motivo-dialog.component';

describe('MotivoDialogComponent', () => {
  let component: MotivoDialogComponent;
  let fixture: ComponentFixture<MotivoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotivoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotivoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
