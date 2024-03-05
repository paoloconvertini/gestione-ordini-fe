import { TestBed } from '@angular/core/testing';

import { ArticoloClasseFornitoreService } from './articolo-classe-fornitore.service';

describe('ArticoloClasseFornitoreServiceService', () => {
  let service: ArticoloClasseFornitoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticoloClasseFornitoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
