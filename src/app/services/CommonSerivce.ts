import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

export abstract class CommonService {
  protected constructor(protected http: HttpClient, protected url:string ) { }

 update(data: any, origin?: string, api?: string): Observable<any> {
    if(origin) {
      this.selezionaServer(origin, api);
    }
   return this.http.put(`${this.url}`, data);
  }

  protected selezionaServer(origin: string, api?: string){
    switch (origin) {
      case 'c':
        this.url = environment.baseUrlCeglie + api;
        break;
      case 'o':
        this.url = environment.baseUrlOstuni + api;
        break;
      default:
    }
  }

}
