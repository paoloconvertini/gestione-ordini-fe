import { Injectable } from '@angular/core';
import {FiltroOrdini} from "../../../models/FiltroOrdini";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../../CommonSerivce";

const url = environment.baseUrl + environment.ORDINI_CLIENTI;

@Injectable({
  providedIn: 'root'
})
export class ListaService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(filtro:any): Observable<any> {
    return this.http.post<any>(`${this.url}/consegne`, filtro);
  }

  getConsegneSettimanali(filtro:any): Observable<any> {
    return this.http.post<any>(`${this.url}/consegne-settimanali`, filtro);
  }

  updateVeicolo(articolo: any): Observable<any> {
    return this.http.put(`${this.url}/updateVeicolo`, articolo);
  }

  getAllRiservati(filtro: FiltroOrdini): Observable<any> {
    return this.http.post<any>(`${this.url}/riservati`, filtro);
  }

  getAllPregressi(filtro: FiltroOrdini): Observable<any> {
    return this.http.post<any>(`${this.url}/pregressi`, filtro);
  }

  savePregressi(selected: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/salvaPregressi`, selected);
  }
}
