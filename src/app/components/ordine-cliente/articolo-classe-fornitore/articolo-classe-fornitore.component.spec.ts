import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticoloClasseFornitoreComponent } from './articolo-classe-fornitore.component';

describe('ArticoloClasseFornitoreComponent', () => {
  let component: ArticoloClasseFornitoreComponent;
  let fixture: ComponentFixture<ArticoloClasseFornitoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArticoloClasseFornitoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticoloClasseFornitoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
