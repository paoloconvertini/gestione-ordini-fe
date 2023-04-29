import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {CommonService} from "../../CommonSerivce";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {OrdineDettaglio} from "../../../models/ordine-dettaglio";
import {FiltroArticoli} from "../../../models/FiltroArticoli";

const url = environment.baseUrl + environment.ARTICOLI_BY_NUM_ORDINE;

@Injectable({
  providedIn: 'root'
})
export class ArticoloService extends CommonService{

  url2: string = environment.baseUrl + environment.ORDINI_CLIENTI;

  constructor(http: HttpClient) {
    super(http, url);
  }

  chiudi(data: any): Observable<any> {
    return this.http.post(`${this.url}/chiudi`, data);
  }

  addFornitoreToArticolo(data: any): Observable<any> {
    return this.http.post(`${this.url}/addFornitore`, data);
  }

  getArticoliByOrdineId(filtro: FiltroArticoli): Observable<OrdineDettaglio> {
    return this.http.post<any>(`${this.url}`, filtro);
  }

  annulla(anno: any, serie: any, progressivo: any): Observable<any> {
    return this.http.get<any>(`${this.url2}/unlock/${anno}/${serie}/${progressivo}`)
  }

  getBolle(progrCliente: any):  Observable<any> {
    return this.http.get<any>(`${this.url}/getBolle/${progrCliente}`)
  }

}
