import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {CommonService} from "../CommonSerivce";
import {environment} from "../../../environments/environment";

const url = environment.baseUrl + environment.OPERAI;

@Injectable({
  providedIn: 'root'
})
export class OperaiService extends CommonService {

  constructor(http: HttpClient) {
    super(http, url);
  }

  getAll(): Observable<any> {
    return this.http.get<any>(this.url);
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

  disattiva(id: number): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}/disattiva`, {});
  }
}
