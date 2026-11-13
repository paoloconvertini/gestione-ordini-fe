import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardCarico {
  anno: number;
  serie: string;
  progressivo: number;
  cliente: string;
  dataCarico: string | null;
  giorni: number | null;
}

export interface Dashboard {
  ordiniAttivi: number | null;
  daCodificare: number | null;
  daOrdinare: number | null;
  daOrdinareModificati?: number | null;
  daOrdinareConNote?: number | null;
  prontoConsegna: number | null;
  consegneDaProgrammare: number | null;
  carichiDaProcessare: number | null;
  senzaBolla: number | null;
  archiviatiSenzaFirma: number | null;
  carichiPiuVecchi: DashboardCarico[] | null;
}

export interface OrdineNotaDaOrdinare {
  anno: number;
  serie: string;
  progressivo: number;
  cliente: string;
  status: string;
  progrGenerale: number;
  rigo: number;
  articolo: string;
  descrizione: string;
  nota: string;
  dataNota: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  noteDaOrdinare(venditore = ''): Observable<OrdineNotaDaOrdinare[]> {
    const params = new HttpParams().set('venditore', venditore);
    return this.http.get<OrdineNotaDaOrdinare[]>(environment.baseUrl + 'dashboard/note-da-ordinare', {params});
  }

  articoli(tipo: string, venditore: string, pagina: number): Observable<{righe: OrdineNotaDaOrdinare[]; totaleOrdini: number}> {
    const params = new HttpParams().set('venditore', venditore).set('pagina', pagina);
    return this.http.get<{righe: OrdineNotaDaOrdinare[]; totaleOrdini: number}>(environment.baseUrl + 'dashboard/articoli/' + tipo, {params});
  }

  get(): Observable<Dashboard> {
    return this.http.get<Dashboard>(environment.baseUrl + 'dashboard');
  }
}
