import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssenzeGiornoDialogComponent } from './assenze-giorno-dialog.component';

describe('AssenzeGiornoDialogComponent', () => {
  let component: AssenzeGiornoDialogComponent;
  let fixture: ComponentFixture<AssenzeGiornoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssenzeGiornoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssenzeGiornoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
