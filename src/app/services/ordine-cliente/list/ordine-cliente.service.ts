import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../../CommonSerivce";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.ORDINI_CLIENTI;
@Injectable({
  providedIn: 'root'
})
export class OrdineClienteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

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

  upload(data: any): Observable<any> {
    return this.http.post(`${this.url}/upload`, data);
  }

  apriOrdine(anno: any, serie: any, progressivo: any, stato: string) {
    return this.http.get<any>(`${this.url}/apriOrdine/${anno}/${serie}/${progressivo}/${stato}`);
  }
}
