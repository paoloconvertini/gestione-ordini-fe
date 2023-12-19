import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmmortamentiRivalutatoComponent } from './ammortamenti-rivalutato.component';

describe('AmmortamentiRivalutatoComponent', () => {
  let component: AmmortamentiRivalutatoComponent;
  let fixture: ComponentFixture<AmmortamentiRivalutatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmmortamentiRivalutatoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmmortamentiRivalutatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
