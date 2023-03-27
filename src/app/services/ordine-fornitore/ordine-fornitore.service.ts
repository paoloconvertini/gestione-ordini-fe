import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

const url = environment.baseUrl + environment.OAF;

@Injectable({
  providedIn: 'root'
})
export class OrdineFornitoreService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }
}
