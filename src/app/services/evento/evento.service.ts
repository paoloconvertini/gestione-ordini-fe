import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.REGISTRO;
@Injectable({
  providedIn: 'root'
})
export class EventoService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getEvento(anno: any, serie: any, progressivo: any, rigo:any): Observable<any> {
    return this.http.get<any>(`${this.url}/${anno}/${serie}/${progressivo}/${rigo}`);
  }
}
