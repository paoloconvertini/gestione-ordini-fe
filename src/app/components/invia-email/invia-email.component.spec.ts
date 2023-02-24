import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviaEmailComponent } from './invia-email.component';

describe('InviaEmailComponent', () => {
  let component: InviaEmailComponent;
  let fixture: ComponentFixture<InviaEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviaEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InviaEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
