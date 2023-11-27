import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";

const url = environment.USER;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(url);
  }

  getUser(id: any): Observable<any> {
    return this.http.get<any>(url + `/${id}`);
  }

  create(id: any, data: any): Observable<any> {
    if(id){
      return this.http.put(url + `/update/${id}`, data);
    }
    return this.http.post(url, data);
  }

  elimina(id: any): Observable<any> {
    return this.http.delete(url + `/${id}`);
  }
}
