import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventActionsDialogComponent } from './event-actions-dialog.component';

describe('EventActionsDialogComponent', () => {
  let component: EventActionsDialogComponent;
  let fixture: ComponentFixture<EventActionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventActionsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventActionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
