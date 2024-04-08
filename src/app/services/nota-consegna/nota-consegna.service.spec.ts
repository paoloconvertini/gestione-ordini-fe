import { TestBed } from '@angular/core/testing';

import { NotaConsegnaService } from './nota-consegna.service';

describe('NotaConsegnaService', () => {
  let service: NotaConsegnaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotaConsegnaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
