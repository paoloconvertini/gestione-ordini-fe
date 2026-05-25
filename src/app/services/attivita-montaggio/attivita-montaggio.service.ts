import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../environments/environment";
import {CommonService} from "../CommonSerivce";

const url = environment.baseUrl + environment.ATTIVITA_MONTAGGIO;

@Injectable({
  providedIn: 'root'
})
export class AttivitaMontaggioService extends CommonService {

  constructor(http: HttpClient) {
    super(http, url);
  }

  search(filtro: any): Observable<any> {
    return this.http.post<any>(`${this.url}/search`, filtro);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post<any>(this.url, dto);
  }

  override update(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
