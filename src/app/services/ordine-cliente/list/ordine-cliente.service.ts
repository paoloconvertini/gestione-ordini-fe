import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CommonService} from "../../CommonSerivce";
import {environment} from "../../../../environments/environment";

const url = environment.baseUrl + environment.ORDINI_CLIENTI;
@Injectable({
  providedIn: 'root'
})
export class OrdineClienteService extends CommonService{

  constructor(http: HttpClient) {
    super(http, url);
  }
}
