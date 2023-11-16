import { TestBed } from '@angular/core/testing';

import { TipocespiteService } from './tipocespite.service';

describe('TipocespiteService', () => {
  let service: TipocespiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipocespiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
