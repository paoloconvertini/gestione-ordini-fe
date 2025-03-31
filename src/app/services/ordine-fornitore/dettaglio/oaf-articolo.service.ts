import { Injectable } from '@angular/core';
import {CommonService} from "../../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.OAF + environment.OAF_ARTICOLI;

@Injectable({
  providedIn: 'root'
})
export class OafArticoloService extends CommonService{
  constructor(http: HttpClient) { super(http, url)}

  approvaOrdine(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/approva/${anno}/${serie}/${progressivo}`);
  }

  richiediOafApprovazioneAll(data: any): Observable<any> {
    return this.http.post(`${this.url}/richiediApprovazione`, data);
  }

  getOafArticoliByOrdineId(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}`);
  }

  richiediOafApprovazione(anno: any, serie: any, progressivo: any): Observable<any> {
    return this.http.get(`${this.url}/richiediApprovazione/${anno}/${serie}/${progressivo}`);
  }

  salvaOafArticoli(result: any): Observable<any> {
    return this.http.post(`${this.url}/salvaRigo`, result);
  }

  eliminaArticolo(anno: any, serie: any, progressivo: any, rigo:any): Observable<any> {
    return this.http.delete<any>(`${this.url}/eliminaArticolo/${anno}/${serie}/${progressivo}/${rigo}`)
  }

  search(data: any): Observable<any> {
    return this.http.post<any>(`${this.url}/cercaArticoli`, data);
  }

  collegaOAF(progrGenerale: any, selected: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/collega-oaf/${progrGenerale}`, selected);
  }
}
