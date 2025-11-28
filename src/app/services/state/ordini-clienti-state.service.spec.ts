import { TestBed } from '@angular/core/testing';

import { OrdiniClientiStateService } from './ordini-clienti-state.service';

describe('OrdiniClientiStateService', () => {
  let service: OrdiniClientiStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdiniClientiStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
