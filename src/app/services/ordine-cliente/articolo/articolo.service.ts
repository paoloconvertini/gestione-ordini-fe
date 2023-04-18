import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {CommonService} from "../../CommonSerivce";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.ARTICOLI_BY_NUM_ORDINE;
@Injectable({
  providedIn: 'root'
})
export class ArticoloService extends CommonService{

  constructor(http: HttpClient) { super(http, url)}

  chiudi(data: any): Observable<any> {
    return this.http.post(`${this.url}/chiudi`, data);
  }

  addFornitoreToArticolo(data: any): Observable<any> {
    return this.http.post(`${this.url}/addFornitore`, data);
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
}
