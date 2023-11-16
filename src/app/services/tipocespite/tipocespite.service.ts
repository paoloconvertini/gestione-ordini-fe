import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../CommonSerivce";
import {FiltroPrimanota} from "../../models/FiltroPrimanota";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.TIPOCESPITE;

@Injectable({
  providedIn: 'root'
})
export class TipocespiteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${this.url}`);
  }
}
