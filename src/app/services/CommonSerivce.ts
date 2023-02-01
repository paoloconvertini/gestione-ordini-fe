import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export abstract class CommonService {
  protected constructor(protected http: HttpClient, protected url:string) { }
  getAll(): Observable<any> {
    return this.http.get<any>(this.url);
  }
  get(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }
  create(data: any): Observable<any> {
    return this.http.post(this.url, data);
  }
 /* update(id:any, data: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, data);
  }
  delete(id: any): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }*/
}
