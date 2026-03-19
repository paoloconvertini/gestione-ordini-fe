import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

const url = environment.OSRM_BASE_URL + environment.ROUTE_DRIVING;

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private http: HttpClient) {}

  getRoute(coords: string[]): Observable<any> {
    const path =
      `${coords.join(';')}?overview=full&geometries=geojson`;
    return this.http.get<any>(`${url}${path}`);
  }

  getOptimizedRoute(coords: string[]) {
    const coordString = coords.join(';');
    return this.http.get<any>(
      environment.OSRM_BASE_URL +
      `trip/v1/driving/${coordString}?overview=full&geometries=geojson`
    );
  }

}
