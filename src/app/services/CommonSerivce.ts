import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export abstract class CommonService {
  protected constructor(protected http: HttpClient, protected url:string) { }
  getAll(status:any): Observable<any> {
    let url = `${this.url}`;
    if(status){
      url += '?status=' + status;
    }
    return this.http.get<any>(url);
  }
  get(id: any): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getArticoliByOrdineId(anno: any, serie: any, progressivo: any): Observable<any> {
    let url = `${this.url}`;
    url += '/' + anno;
    url += '/' + serie;
    url += '/' + progressivo;
    return this.http.get<any>(url);
  }
  create(data: any): Observable<any> {
    return this.http.post(this.url, data);
  }

  upload(data: any): Observable<any> {
    return this.http.post(`${this.url}/upload`, data);
  }

 update(data: any): Observable<any> {
    return this.http.put(`${this.url}`, data);
  }
}
