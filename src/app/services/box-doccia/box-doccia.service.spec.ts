import { TestBed } from '@angular/core/testing';

import { BoxDocciaService } from './box-doccia.service';

describe('BoxDocciaService', () => {
  let service: BoxDocciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxDocciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
