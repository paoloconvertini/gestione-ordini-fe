import { TestBed } from '@angular/core/testing';

import { ListaCarichiService } from './lista-carichi.service';

describe('ListaCarichiService', () => {
  let service: ListaCarichiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaCarichiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
