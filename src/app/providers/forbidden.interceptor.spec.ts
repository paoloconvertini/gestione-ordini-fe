import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ForbiddenInterceptor } from './forbidden.interceptor';

describe('ForbiddenInterceptor', () => {
  it('notifies for an empty 400 response and propagates the original error', () => {
    const snackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
    const interceptor = new ForbiddenInterceptor(snackbar);
    const error = new HttpErrorResponse({ status: 400, error: null });
    const handler = { handle: () => throwError(() => error) } as HttpHandler;
    let received: unknown;
    interceptor.intercept(new HttpRequest('POST', '/api/appuntamenti', {}), handler)
      .subscribe({ error: err => received = err });
    expect(received).toBe(error);
    expect(snackbar.open).toHaveBeenCalledWith(
      'Dati non validi. Verificare i campi inseriti.', 'Chiudi', jasmine.any(Object));
  });
});
