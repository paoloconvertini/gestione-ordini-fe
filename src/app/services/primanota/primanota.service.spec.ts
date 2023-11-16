import { TestBed } from '@angular/core/testing';

import { PrimanotaService } from './primanota.service';

describe('PrimanotaService', () => {
  let service: PrimanotaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimanotaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
