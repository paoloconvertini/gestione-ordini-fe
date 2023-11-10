import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.CESPITI;

@Injectable({
  providedIn: 'root'
})
export class CespiteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${this.url}`);
  }


  getAllCespiti(): Observable<any> {
    return this.http.get<any>(`${this.url}/cespiti`);
  }

  calcola(dataCalcolo: any) {
    return this.http.get<any>(`${this.url}/calcola/${dataCalcolo}`)
  }
}
