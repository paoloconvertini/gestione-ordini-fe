import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export const FAKE_JWT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJncC1hcGktc2VydmljZSIsImV4cCI6MTY3NDkxODQ2MzE2OSwiZ3JvdXBzIjpbIlVzZXIiLCJBZG1pbiJdLCJpYXQiOjE2NzQ5MTg0NTksImp0aSI6ImRhNWFlZWRjLTVmMTQtNDc4Yi05YmNmLWI0NDA1YzQzODQyNSIsImlzcyI6ImF1dGhlbnRpY2F0aW9uLXNlcnZpY2UifQ.GUttfV9z1VIPK8QoGHUJ6HR6hb4P2L4-BSFszoe7lByGmmNOwdv2elbQQWXn8SEkqE7OlXrxKTbj1avGpXBbbcOXtxgUJpTqSdHJ_q9ml9dx9BJvERTb7NP6kftKwqHRmDh1hMg35SFx7IO6OKJS2R5lm5hH5NEBskhSUXlRXCKR2RYpTJYVqiZZSSas8kKX4dC2COL-7i0uwdZJz_VLj-BdNnJZpDGnSQVqN3ZuL2HTr09t02LKhYedRdk_MZq9sf3TgeamZy8mDdwTzWKjzADO4C_iapvNkRumBn9kanDKZKlXH5qGuxbgIUiMMdYaVQb211ZmRz6RiLE2uQnLGQ'

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const { url, method, headers } = request;

    if (url.endsWith('ordini-clienti') && method === 'GET') {
      return handleGetAllOrdiniClienti();
    } else if (url.includes('articoli') && method === 'GET') {
      return handleGetAllArticoli();
    }
    return next.handle(request);

    function handleGetAllOrdiniClienti() {
      return of(
        new HttpResponse({
          status: 200,
          body: [
            {
              'numero': '2023/01/1000',
              'cliente': 'Mario Rossi',
              'data': '26/01/2023'
            },
            {
              'numero': '2023/03/2034',
              'cliente': 'Giuseppe Bianchi',
              'data': '22/01/2023'
            }
          ],
        })
      );
    }

    function handleGetAllArticoli() {
      return of(
        new HttpResponse({
          status: 200,
          body: [
            {
              'codice': '103024',
              'descrizione': 'Inda specchio 80x60',
              'quantita': '1',
              'prezzo': '50',
              'flRiservato': true,
              'flDisponibile': true,
              'flOrdinato': false,
              'dataUltimaModifica': '28/12/2022',
              'utenteUltimaModifica': 'Mario Rossi'
            },
            {
              'codice': '105524',
              'descrizione': 'Box doccia',
              'quantita': '1',
              'prezzo': '750',
              'flRiservato': false,
              'flDisponibile': false,
              'flOrdinato': false,
              'dataUltimaModifica': '25/01/2023',
              'utenteUltimaModifica': 'Venditore 1'
            }
          ],
        })
      );
    }

  }
}

export const FakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true,
};
