import { TestBed } from '@angular/core/testing';

import { AssenzaService } from './assenza.service';

describe('AssenzaService', () => {
  let service: AssenzaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssenzaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
