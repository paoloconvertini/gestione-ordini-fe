import {RichiestaCaricoInfissi, RipartizioneCaricoInfissi} from '../../models/carico-infissi';
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


  anteprimaInfissi(richiesta: RichiestaCaricoInfissi) {
    return this.http.post<RipartizioneCaricoInfissi>(`${this.url}/infissi/anteprima`, richiesta);
  }

  caricaInfissi(richiesta: RichiestaCaricoInfissi) {
    return this.http.post<{msg: string; error: boolean}>(`${this.url}/infissi`, richiesta);
  }

  getVettori() {
    return this.http.get(`${this.url}/vettori`)
  }

  getCausali() {
    return this.http.get(`${this.url}/causali`)
  }
}
