import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonService } from "../CommonSerivce";
import { Observable } from "rxjs";

const url = environment.baseUrl + environment.PERMISSIONS;

@Injectable({
  providedIn: 'root'
})
export class PermissionApiService extends CommonService {

  constructor(http: HttpClient) {
    super(http, url);
  }

  // GET all permissions (now includes roles)
  getAll(): Observable<any> {
    return this.http.get(url);
  }

  // GET roles associated to a specific permission
  getRolesOfPermission(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${url}/${id}/roles`);
  }


  // CREATE permission
  create(permission: { name: string; description: string }): Observable<any> {
    return this.http.post(url, permission);
  }

  // UPDATE permission
  updatePermesso(id: number, dto: { name: string; description: string }): Observable<any> {
    return this.http.put(`${url}/${id}`, dto);
  }


  // DELETE permission
  delete(id: number): Observable<any> {
    return this.http.delete(`${url}/${id}`);
  }
}
