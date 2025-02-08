import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaricoMagazzinoDialogComponent } from './carico-magazzino-dialog.component';

describe('CaricoMagazzinoDialogComponent', () => {
  let component: CaricoMagazzinoDialogComponent;
  let fixture: ComponentFixture<CaricoMagazzinoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaricoMagazzinoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaricoMagazzinoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
