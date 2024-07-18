import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ListaCarichi} from "../../models/listaCarichi";
import {FiltroCarichi} from "../../models/FiltroCarichi";
import {Deposito} from "../../models/deposito";

const url = environment.baseUrl + environment.LISTA_DI_CARICO;


@Injectable({
  providedIn: 'root'
})
export class ListaCarichiService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  searchAllCarichi(filtroCarichi:FiltroCarichi) :Observable<any> {
    return this.http.post<any>(`${this.url}`, filtroCarichi);
  }


  create(carico: ListaCarichi):Observable<any> {
    return this.http.post<any>(`${this.url}/salva`, carico);
  }

  getCarico(id: any):Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  generaPdf(id:number) {
    window.document.location.href = `${this.url}/generaPdf/${id}`;
  }

  convalida(selected: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/convalida`, selected);
  }

  searchAzienda(search:string): Observable<any> {
    return this.http.get<any>(`${this.url}/cercaAzienda/${search}` );
  }

  searchDeposito(search:string): Observable<any> {
    return this.http.get<any>(`${this.url}/cercaDeposito/${search}` );
  }

  searchTrasportatore(search:string): Observable<any> {
    return this.http.get<any>(`${this.url}/cercaTrasportatore/${search}` );
  }

  getAllDepositi(): Observable<any> {
    return this.http.get<any>(`${this.url}/depositi` );
  }


  elimina(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/depositi/${id}` );
  }

  save(deposito: Deposito) : Observable<any> {
    return this.http.post<any>(`${this.url}/depositi`, deposito );
  }

}
