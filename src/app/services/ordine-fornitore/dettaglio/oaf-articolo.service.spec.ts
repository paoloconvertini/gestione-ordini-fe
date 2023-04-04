import { TestBed } from '@angular/core/testing';

import { OafArticoloService } from './oaf-articolo.service';

describe('OafArticoloService', () => {
  let service: OafArticoloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OafArticoloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
