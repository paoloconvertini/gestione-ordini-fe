import { TestBed } from '@angular/core/testing';

import { CespiteService } from './cespite.service';

describe('CespiteService', () => {
  let service: CespiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CespiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
