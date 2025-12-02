import { TestBed } from '@angular/core/testing';

import { OrdiniFornitoreStateService } from './ordini-fornitore-state.service';

describe('OrdiniFornitoreStateService', () => {
  let service: OrdiniFornitoreStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdiniFornitoreStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
