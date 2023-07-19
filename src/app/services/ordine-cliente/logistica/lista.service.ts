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
}
