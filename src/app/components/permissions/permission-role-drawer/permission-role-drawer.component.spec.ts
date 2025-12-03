import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionRoleDrawerComponent } from './permission-role-drawer.component';

describe('PermissionRoleDrawerComponent', () => {
  let component: PermissionRoleDrawerComponent;
  let fixture: ComponentFixture<PermissionRoleDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionRoleDrawerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionRoleDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
