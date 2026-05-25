import { TestBed } from '@angular/core/testing';

import { TipiAttivitaMontaggioService } from './tipi-attivita-montaggio.service';

describe('TipiAttivitaMontaggioService', () => {
  let service: TipiAttivitaMontaggioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipiAttivitaMontaggioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
