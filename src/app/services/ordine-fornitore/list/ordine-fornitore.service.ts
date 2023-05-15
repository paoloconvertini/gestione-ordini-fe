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

  creaOrdineFornitori(anno: any, serie: any, progressivo: any) {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}`);
  }

  getAllOaf(status:any): Observable<any> {
    return this.http.get<any>(`${this.url}/${status}`);
  }

  richiediOafApprovazioneAll(data: any): Observable<any> {
    return this.http.post(`${this.url}/richiediApprovazione`, data);
  }

  richiediOafApprovazione(anno: any, serie: any, progressivo: any): Observable<any> {
    return this.http.get(`${this.url}/richiediApprovazione/${anno}/${serie}/${progressivo}`);
  }
}
