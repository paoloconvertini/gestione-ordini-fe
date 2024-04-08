import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../CommonSerivce";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.NOTA_CONSEGNA;

@Injectable({
  providedIn: 'root'
})
export class NotaConsegnaService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }
  getNota(data:any): Observable<any> {
    return this.http.get<any>(`${this.url}/${data}` );
  }

  salvaNota(nota:any): Observable<any> {
    return this.http.post<any>(`${this.url}`, nota);
  }
}
