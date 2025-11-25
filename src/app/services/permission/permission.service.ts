import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permission } from '../../models/permission';

const baseUrl = environment.baseAuthUrl + environment.PERMISSIONS;

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(baseUrl);
  }

  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${baseUrl}/role/${roleId}`);
  }

  updateRolePermissions(roleId: number, permissionIds: any): Observable<any> {
    return this.http.post(`${baseUrl}/role/${roleId}`, permissionIds);
  }
}
