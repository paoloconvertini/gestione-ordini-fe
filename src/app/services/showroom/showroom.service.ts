import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {FiltroShowroom} from "../../models/FiltroShowroom";

@Injectable({
  providedIn: 'root'
})
export class ShowroomService {

  private baseUrl = environment.baseUrl + environment.SHOWROOM;

  constructor(private http: HttpClient) {}

  search(filtro: FiltroShowroom) {
    return this.http.post<any>(`${this.baseUrl}/search`, filtro);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getProvince() {
    return this.http.get<string[]>(`${this.baseUrl}/province`);
  }

  searchComuni(provincia: string | null, q: string) {
    return this.http.get<any[]>(`${this.baseUrl}/comuni`, {
      params: {
        provincia: provincia || '',
        q: q
      }
    });
  }

  getMotiviRoot() {
    return this.http.get<any[]>(`${this.baseUrl}/motivi/root`);
  }

  getMotiviFigli(parentId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/motivi/${parentId}/figli`);
  }

  getMotivoById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/motivi/${id}`);
  }

  create(dto: any) {
    return this.http.post(this.baseUrl, dto);
  }

  update(id: number, dto: any) {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  searchClienti(q: string) {
    return this.http.get<any[]>(`${this.baseUrl}/clienti/search`, { params: { q } });
  }

  associaCliente(id: number, codiceCliente: string) {
    return this.http.put(`${this.baseUrl}/${id}/associa-cliente`, { codiceCliente });
  }

  createMotivo(dto: any) {
    return this.http.post(`${this.baseUrl}/motivi`, dto);
  }

  updateMotivo(id: number, dto: any) {
    return this.http.put(`${this.baseUrl}/motivi/${id}`, dto);
  }

  disattivaMotivo(id: number) {
    return this.http.put(`${this.baseUrl}/motivi/${id}/disattiva`, {});
  }

  getSedi() {
    return this.http.get<any[]>(`${this.baseUrl}/sedi`);
  }
}
