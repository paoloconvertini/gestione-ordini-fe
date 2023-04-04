import { TestBed } from '@angular/core/testing';

import { OrdineClienteService } from './ordine-cliente.service';

describe('OrdineClienteService', () => {
  let service: OrdineClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdineClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
