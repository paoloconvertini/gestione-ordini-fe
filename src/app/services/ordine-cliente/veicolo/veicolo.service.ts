import { Injectable } from '@angular/core';
import {CommonService} from "../../CommonSerivce";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.VEICOLO;


@Injectable({
  providedIn: 'root'
})
export class VeicoloService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }

  getVeicoli():  Observable<any> {
    return this.http.get<any>(`${this.url}`)
  }
}
