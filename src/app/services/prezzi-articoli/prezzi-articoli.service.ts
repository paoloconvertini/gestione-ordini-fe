import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AggiornamentoPrezzi, PrezziArticoli } from '../../models/prezzo-articolo';

@Injectable({ providedIn: 'root' })
export class PrezziArticoliService {
  private readonly url = environment.baseUrl + 'prezzi-articoli';

  constructor(private http: HttpClient) {}

  cerca(classeA1: string, percentuale: number | null, includiBloccati: boolean): Observable<PrezziArticoli> {
    let params = new HttpParams().set('classeA1', classeA1).set('includiBloccati', includiBloccati);
    if (percentuale !== null) params = params.set('percentuale', percentuale);
    return this.http.get<PrezziArticoli>(this.url, { params });
  }

  classiFornitore(): Observable<{ codice: string; descrizione: string }[]> {
    return this.http.get<{ codice: string; descrizione: string }[]>(this.url + '/classi-fornitore');
  }

  salvaSoglia(classeA1: string, percentuale: number, ricaricoImpostato: number | null): Observable<{ msg: string; error: boolean }> {
    return this.http.put<{ msg: string; error: boolean }>(this.url + '/soglia-fornitore',
      { classeA1, percentuale, ricaricoImpostato });
  }

  aggiorna(richiesta: AggiornamentoPrezzi): Observable<{ msg: string; error: boolean }> {
    return this.http.put<{ msg: string; error: boolean }>(this.url, richiesta);
  }
}
