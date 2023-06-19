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
}
