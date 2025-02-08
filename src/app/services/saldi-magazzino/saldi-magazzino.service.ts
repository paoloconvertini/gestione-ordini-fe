import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";

const url = environment.baseUrl + environment.SALDI_MAGAZINO;

@Injectable({
  providedIn: 'root'
})
export class SaldiMagazzinoService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }


  caricaMagazzino(result: any) {
    return this.http.post<any>(`${this.url}`, result);
  }


  getVettori() {
    return this.http.get(`${this.url}/vettori`)
  }

  getCausali() {
    return this.http.get(`${this.url}/causali`)
  }
}
