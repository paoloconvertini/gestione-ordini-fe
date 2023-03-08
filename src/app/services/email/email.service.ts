import { Injectable } from '@angular/core';
import {CommonService} from "../CommonSerivce";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";

const url = environment.baseUrl + environment.EMAIL;
@Injectable({
  providedIn: 'root'
})
export class EmailService extends CommonService{

  constructor(http: HttpClient) {super(http, url);}
}
