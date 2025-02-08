import { TestBed } from '@angular/core/testing';

import { SaldiMagazzinoService } from './saldi-magazzino.service';

describe('SaldiMagazzinoService', () => {
  let service: SaldiMagazzinoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaldiMagazzinoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
