import { TestBed } from '@angular/core/testing';

import { PianocontiService } from './pianoconti.service';

describe('PianocontiService', () => {
  let service: PianocontiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PianocontiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
