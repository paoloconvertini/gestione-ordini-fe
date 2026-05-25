import { TestBed } from '@angular/core/testing';

import { AttivitaMontaggioService } from './attivita-montaggio.service';

describe('AttivitaMontaggioService', () => {
  let service: AttivitaMontaggioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttivitaMontaggioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
