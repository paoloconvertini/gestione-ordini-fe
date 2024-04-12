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

  addNotes(result: any): Observable<any> {
    return this.http.post(`${this.url}/addNotes`, result)
  }

  getAcconti(sottoConto: string): Observable<any> {
    return this.http.get(`${this.url}/getAcconti/${sottoConto}`)
  }

  codificaArticoli(list: any): Observable<any> {
    return this.http.post(`${this.url}/codificaArticoli`, list)
  }

  getArticoli(bolla:string, anno: number | undefined, serie: string | undefined, progressivo: number | undefined): Observable<any> {
    return this.http.get(`${this.url}/getArticoli/${bolla}/${anno}/${serie}/${progressivo}`);
  }

  getArticoliRiservati(anno: number | undefined, serie: string | undefined, progressivo: number | undefined): Observable<any> {
    return this.http.get(`${this.url}/getArticoliRiservati/${anno}/${serie}/${progressivo}`);
  }

  creaBolla(data: any, accontoDtos: any): Observable<any> {
    let body = {
      list: data,
      accontoDtos: accontoDtos
    }
    return this.http.post(`${this.url}/creaBolla`, body);
  }

  cercaAcconti(sottoConto: string, list: any[]): Observable<any> {
    return this.http.post(`${this.url}/cercaAcconti/${sottoConto}`, list);
  }

  cercaSchedeTecniche(list: any[]): Observable<any> {
    return this.http.post(`${this.url}/cercaSchedeTecniche`, list);
  }

  cercaCartelleSchedeTecniche(): Observable<any> {
    return this.http.get(`${this.url}/cercaCartelleSchedeTecniche`);
  }

  uploadSchedeTecniche(data: any): Observable<any> {
    return this.http.post(`${this.url}/uploadSchedeTecniche`, data);
  }

  scaricaSchedeTecniche(list: any[]) : Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.post(`${this.url}/scaricaSchedeTecniche`, list, httpOptions);
  }


  getSaldoContabile(sottoConto: any): Observable<any> {
    return  this.http.get(`${this.url}/saldoContabile/${sottoConto}`)
  }

  getOrdiniAperti(sottoConto: any): Observable<any> {
    return  this.http.get(`${this.url}/ordiniAperti/${sottoConto}`)
  }

  getAccontiFatturati(sottoConto: any): Observable<any> {
    return  this.http.get(`${this.url}/accontiFatturati/${sottoConto}`)
  }

  getBolleNonFatturate(sottoConto: any): Observable<any> {
    return  this.http.get(`${this.url}/bolleNonFatturate/${sottoConto}`)
  }

}
