import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export abstract class CommonService {
  protected constructor(protected http: HttpClient, protected url:string) { }
  getAll(status:any, update: boolean): Observable<any> {
    let url = `${this.url}`;
    if(update) {
      url += '/updateConsegne';
    }
    if(status){
      url += '?status=' + status;
    }
    return this.http.get<any>(url);
  }

  getAllOaf(status:any, update: boolean): Observable<any> {
    let url = `${this.url}`;
    if(update) {
      url += '/updateConsegne';
    }
    if(status){
      url += '?status=' + status;
    }
    return this.http.get<any>(url);
  }

  getEvento(anno: any, serie: any, progressivo: any, rigo:any): Observable<any> {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}/${rigo}`);
  }

  getArticoliByOrdineId(anno: any, serie: any, progressivo: any, filtro: boolean): Observable<any> {
    let url = `${this.url}`;
    url += '/' + anno;
    url += '/' + serie;
    url += '/' + progressivo;
    if(filtro) {
      url += '/' + filtro;
    }
    return this.http.get<any>(url);
  }
  create(data: any): Observable<any> {
    return this.http.post(this.url, data);
  }

  upload(data: any): Observable<any> {
    return this.http.post(`${this.url}/upload`, data);
  }

 update(data: any): Observable<any> {
    return this.http.put(`${this.url}`, data);
  }

  chiudi(data: any): Observable<any> {
    return this.http.post(`${this.url}/chiudi`, data);
  }

  richiediOafApprovazione(anno: any, serie: any, progressivo: any): Observable<any> {
    return this.http.get(`${this.url}/richiediApprovazione/${anno}/${serie}/${progressivo}`);
  }

  getFornitori(): Observable<any> {
    return this.http.get(`${this.url}/getFornitori`);
  }

  addFornitoreToArticolo(data: any): Observable<any> {
    return this.http.post(`${this.url}/addFornitore`, data);
  }

  richiediOafApprovazioneAll(data: any): Observable<any> {
    return this.http.post(`${this.url}/richiediApprovazione`, data);
  }

  inviaMail(data: any): Observable<any> {
    return this.http.post(`${this.url}/confermato`, data);
  }

  creaOrdineFornitori(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}`);
  }

  apriOrdine(anno: any, serie: any, progressivo: any, stato: string) {
    return this.http.get<any>(`${this.url}/apriOrdine/${anno}/${serie}/${progressivo}/${stato}`);
  }

  getOafArticoliByOrdineId(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}`);
  }

  approvaOrdine(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/approva/${anno}/${serie}/${progressivo}`);
  }
}
