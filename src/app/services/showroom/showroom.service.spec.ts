import { TestBed } from '@angular/core/testing';

import { ShowroomService } from './showroom.service';

describe('ShowroomServiceService', () => {
  let service: ShowroomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowroomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
