import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVisiteDialogComponent } from './registro-visite-dialog.component';

describe('RegistroVisiteDialogComponent', () => {
  let component: RegistroVisiteDialogComponent;
  let fixture: ComponentFixture<RegistroVisiteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroVisiteDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroVisiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
