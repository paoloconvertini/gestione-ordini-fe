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

  inviaMail(data: any): Observable<any> {
    return this.http.post(`${this.url}`, data);
  }

  creaOrdineFornitori(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}`);
  }
}
