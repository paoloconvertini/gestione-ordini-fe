import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../CommonSerivce";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.TIPOCESPITE;

@Injectable({
  providedIn: 'root'
})
export class TipocespiteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(origin: string): Observable<any> {
    this.selezionaServer(origin, environment.TIPOCESPITE);
    return this.http.get<any>(`${this.url}`);
  }

  getTipoCespiti(origin: string): Observable<any>{
    this.selezionaServer(origin, environment.TIPOCESPITE);
    return this.http.get<any>(`${this.url}/tipocespiti`);
  }

  getById(id: any, origin: string) : Observable<any> {
    this.selezionaServer(origin, environment.TIPOCESPITE);
    return this.http.get(`${this.url}/${id}`);
  }

  save(data: any, origin: string) : Observable<any> {
    this.selezionaServer(origin, environment.TIPOCESPITE);
    return this.http.post(`${this.url}`, data);
  }
}
