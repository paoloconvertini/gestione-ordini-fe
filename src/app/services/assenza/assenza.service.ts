import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonService } from '../CommonSerivce';

const url = environment.baseUrl + environment.ASSENZE;

@Injectable({
  providedIn: 'root'
})
export class AssenzaService extends CommonService {

  constructor(http: HttpClient) {
    super(http, url);
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

  getCalendario(dataDa: string, dataA: string): Observable<any> {
    const params = new HttpParams()
      .set('dataDa', dataDa)
      .set('dataA', dataA);
    return this.http.get<any>(`${this.url}/calendario`, { params });
  }

  getByDate(data: string): Observable<any> {
    return this.http.get<any>(`${this.url}/giorno/${data}`);
  }
}
