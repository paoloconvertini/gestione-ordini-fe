import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperaioDialogComponent } from './operaio-dialog.component';

describe('OperaioDialogComponent', () => {
  let component: OperaioDialogComponent;
  let fixture: ComponentFixture<OperaioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperaioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperaioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
