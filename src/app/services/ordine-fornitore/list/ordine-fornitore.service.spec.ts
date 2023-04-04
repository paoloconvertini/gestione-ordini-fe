import { TestBed } from '@angular/core/testing';

import { OrdineFornitoreService } from './ordine-fornitore.service';

describe('OrdineFornitoreService', () => {
  let service: OrdineFornitoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdineFornitoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
