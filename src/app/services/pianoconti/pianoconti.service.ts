import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../CommonSerivce";
import {Observable} from "rxjs";

const url = environment.baseUrl + environment.PIANOCONTI;


@Injectable({
  providedIn: 'root'
})
export class PianocontiService extends CommonService {

  constructor(http: HttpClient) {
    super(http, url);
  }

  getFornitori(): Observable<any> {
    return this.http.get(`${this.url}/getFornitori`);
  }
}
