import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.EMAIL;
@Injectable({
  providedIn: 'root'
})
export class EmailService extends CommonService{

  constructor(http: HttpClient) {super(http, url);}

  inviaMail(data: any): Observable<any> {
    return this.http.post(`${this.url}/confermato`, data);
  }

  inviaMailListaCarico(data: any): Observable<any> {
    return this.http.post(`${this.url}/lista-carico`, data);
  }
}
