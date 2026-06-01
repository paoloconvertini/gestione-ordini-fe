import { TestBed } from '@angular/core/testing';

import { AppuntamentoService } from './appuntamento.service';

describe('AppuntamentoService', () => {
  let service: AppuntamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppuntamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
