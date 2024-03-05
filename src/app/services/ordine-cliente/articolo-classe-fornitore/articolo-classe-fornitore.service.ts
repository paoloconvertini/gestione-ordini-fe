import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {CommonService} from "../../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ArticoloClasseFornitore} from "../../../models/ArticoloClasseFornitore";

const url = environment.baseUrl + environment.ARTICOLO_CLASSE_FORNITORE;

@Injectable({
  providedIn: 'root'
})
export class ArticoloClasseFornitoreService extends CommonService {

  constructor(http: HttpClient) {
    super(http, url);
  }


  getClassi() : Observable<any> {
    return this.http.get<any>(this.url)
  }

  saveClasse(a: ArticoloClasseFornitore): Observable<any>{
    return this.http.post(this.url, a);
  }

}
