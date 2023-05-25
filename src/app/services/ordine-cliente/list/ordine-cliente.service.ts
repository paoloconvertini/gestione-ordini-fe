import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../../CommonSerivce";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {FiltroOrdini} from "../../../models/FiltroOrdini";

const url = environment.baseUrl + environment.ORDINI_CLIENTI;
@Injectable({
  providedIn: 'root'
})
export class OrdineClienteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(filtro:FiltroOrdini): Observable<any> {
    return this.http.post<any>(`${this.url}`, filtro);
  }

  aggiornaLista(): Observable<any> {
    return this.http.get<any>(`${this.url}/aggiornaListaOrdini`);
  }

  upload(data: any): Observable<any> {
    return this.http.post(`${this.url}/upload`, data);
  }

  apriOrdine(anno: any, serie: any, progressivo: any, stato: string) {
    return this.http.get<any>(`${this.url}/apriOrdine/${anno}/${serie}/${progressivo}/${stato}`);
  }

  sbloccaOrdine(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/unlock/${anno}/${serie}/${progressivo}`);
  }

  addNotes(result: any): Observable<any> {
    return this.http.post(`${this.url}/addNotes`, result)
  }

  getStati() : Observable<any> {
    return this.http.get(`${this.url}/getStati`);
  }
}
