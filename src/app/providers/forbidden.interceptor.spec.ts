import { TestBed } from '@angular/core/testing';

import { ForbiddenInterceptorInterceptor } from './forbidden.interceptor';

describe('ForbiddenInterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ForbiddenInterceptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: ForbiddenInterceptorInterceptor = TestBed.inject(ForbiddenInterceptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
