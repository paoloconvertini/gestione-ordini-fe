import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FiltroPrimanota} from "../../models/FiltroPrimanota";
import {environment} from "../../../environments/environment";

const url = environment.baseUrl + environment.PRIMANOTA;


@Injectable({
  providedIn: 'root'
})
export class PrimanotaService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(filtro: FiltroPrimanota): Observable<any> {
    return this.http.post<any>(`${this.url}`, filtro);
  }

  save(primanota: any): Observable<any> {
    return this.http.put<any>(`${this.url}`, primanota);
  }

}
