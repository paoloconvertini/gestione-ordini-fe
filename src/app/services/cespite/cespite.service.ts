import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {Observable} from "rxjs";
import {FiltroCespite} from "../../models/FiltroCespite";
import {QuadraturaCespite} from "../../models/QuadraturaCespite";

const url = environment.baseUrl + environment.CESPITI;

@Injectable({
  providedIn: 'root'
})
export class CespiteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(filtro: FiltroCespite, origin: string): Observable<any> {
    this.selezionaServer(origin, environment.CESPITI);
    return this.http.post<any>(`${this.url}`, filtro);
  }


  getAllCespiti(origin: string): Observable<any> {
    this.selezionaServer(origin, environment.CESPITI);
    return this.http.get<any>(`${this.url}/cespiti`);
  }

  calcola(dataCalcolo: any, origin: string) {
    this.selezionaServer(origin, environment.CESPITI);
    return this.http.get<any>(`${this.url}/calcola/${dataCalcolo}`)
  }

  elimina(id: any, origin: string): Observable<any>{
    this.selezionaServer(origin, environment.CESPITI);
    return this.http.delete(url + `/${id}`);
  }

  salvaQuad(quad: QuadraturaCespite) : Observable<any>{
    this.selezionaServer(origin, environment.CESPITI);
    return this.http.post(url + `/salvaQuadratura`, quad);
  }

  contabilizzaAmm(): Observable<any> {
    this.selezionaServer(origin, environment.CESPITI);
    return this.http.get(url + `/contabilizzaAmm`);
  }
}
