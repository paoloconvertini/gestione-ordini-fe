import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const url = environment.ROLE;


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(url);
  }

  elimina(id: any): Observable<any>{
    return this.http.delete(url + `/${id}`);
  }

  save(data:any): Observable<any>{
    return this.http.post(url, data);
  }

  update(data:any): Observable<any>{
    return this.http.put(url + `/${data.id}`, data);
  }
}
