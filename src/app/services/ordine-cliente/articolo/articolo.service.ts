import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";
import {CommonService} from "../../CommonSerivce";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {HttpClient} from "@angular/common/http";

const url = environment.baseUrl + environment.ARTICOLI_BY_NUM_ORDINE;
@Injectable({
  providedIn: 'root'
})
export class ArticoloService extends CommonService{

  constructor(http: HttpClient) { super(http, url)}
}
