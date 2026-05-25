import { TestBed } from '@angular/core/testing';

import { OperaiService } from './operai.service';

describe('OperaiService', () => {
  let service: OperaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperaiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
