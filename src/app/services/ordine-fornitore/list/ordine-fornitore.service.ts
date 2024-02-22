import { Injectable } from '@angular/core';
import {CommonService} from "../../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.OAF;

@Injectable({
  providedIn: 'root'
})
export class OrdineFornitoreService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  creaOrdineFornitori(articoli: any) {
    return this.http.post<any>(`${this.url}`, articoli);
  }

  getAllOaf(status:any): Observable<any> {
    let url = `${this.url}`;
    if(status) {
      url += `/${status}`;
    }
    return this.http.get<any>(url);
  }

  richiediOafApprovazioneArticoli(anno: any, serie: any, progressivo: any, data: any): Observable<any> {
    return this.http.post(`${this.url}/articoli/richiediApprovazione/${anno}/${serie}/${progressivo}`, data);
  }

  richiediOafApprovazione(anno: any, serie: any, progressivo: any ): Observable<any> {
    return this.http.get(`${this.url}/richiediApprovazione/${anno}/${serie}/${progressivo}`);
  }

  unisciOrdini(data: any[]): Observable<any> {
    return this.http.post(`${this.url}/unisciOrdini`, data);
  }

  apriOrdine(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/apriOrdine/${anno}/${serie}/${progressivo}`);
  }

  eliminaOrdine(anno: any, serie: any, progressivo: any): Observable<any> {
    return this.http.delete<any>(`${this.url}/eliminaOrdine/${anno}/${serie}/${progressivo}`)
  }

  addNotes(result: any): Observable<any> {
    return this.http.post(`${this.url}/addNotes`, result)
  }

  updateOaf(filteredData: any) : Observable<any> {
      return this.http.put(`${this.url}/inviato`, filteredData);
  }

  download(ordine: any) {
    window.document.location.href = `${this.url}/scaricaOrdine/${ordine.anno}/${ordine.serie}/${ordine.progressivo}`;
  }

  verificaOAF(result: any): Observable<any> {
    return this.http.post(`${this.url}/verificaOAF`, result)
  }

  collegaOAF(result: any): Observable<any> {
    return this.http.post(`${this.url}/collegaOAF`, result)
  }

  getOafByOperatore(): Observable<any> {
    return this.http.get<any>(`${this.url}/byOperatore`);
  }

}
