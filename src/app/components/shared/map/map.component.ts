import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import OlMap from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Cluster, Vector as VectorSource} from 'ol/source';
import {MultiPoint, Point} from 'ol/geom';
import {Feature} from 'ol';
import {Fill, Stroke, Style, Text} from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import {useGeographic} from 'ol/proj';
import {boundingExtent} from 'ol/extent';
import Overlay from 'ol/Overlay';
import {LineString} from 'ol/geom';
import {RouteService} from "../../../services/route/route.service";
import {RegularShape} from "ol/style.js";
import {MatSnackBar} from "@angular/material/snack-bar";

useGeographic();

const sedeLonLat = [17.5083, 40.6472];
const sede = new Point(sedeLonLat);

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {

  constructor(private service: RouteService, private snackbar: MatSnackBar) { }

  @Input() ordini: any[] = [];
  @Input() giornoLabel: string = '';
  @Output() optimizationApplied = new EventEmitter<any[]>();
  @ViewChild('popup') popupElement!: ElementRef;
  @ViewChild('popupContent') popupContent!: ElementRef;

  private ordiniFiltrati: any[] = [];
  selectedVeicolo: number | null = null;
  selectedFascia: 'M' | 'P' | null = null;
  private map!: OlMap;
  private styleCache: any = {};
  private clusterLayer!: VectorLayer<VectorSource>;
  private routeLayer!: VectorLayer<VectorSource>;
  private optimizedRouteLayer!: VectorLayer<VectorSource>;
  routeStats: Record<string, { km: number; time: number }> = {};
  optimizedStats: Record<string, { km: number; time: number }> = {};
  savingStats: Record<string, { km: number; time: number }> = {};
  currentOrder: any[] = [];
  optimizedOrder: any[] = [];


  private overlay!: Overlay;

  ngAfterViewInit(): void {
    this.initMap();
    if (this.ordini?.length) {
      this.renderMarkers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ordini'] && this.map && this.clusterLayer) {
      this.renderMarkers();
    }
  }

  private initMap(): void {
    this.map = new OlMap({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: sedeLonLat,
        zoom: 9
      })
    });
    this.overlay = new Overlay({
      element: this.popupElement.nativeElement,
      positioning: 'bottom-center',
      autoPan: true
    });

    this.map.addOverlay(this.overlay);
    this.clusterLayer = new VectorLayer({
      source: new Cluster({
        distance: 10,
        source: new VectorSource()
      }),
      style: this.clusterStyle
    });

    this.routeLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(25,118,210,0.6)',
          width: 4
        })
      })
    });
    this.optimizedRouteLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(76,175,80,0.7)',
          width: 4,
          lineDash: [10, 10]
        })
      })
    });
    this.map.addLayer(this.routeLayer);
    this.map.addLayer(this.optimizedRouteLayer);
    this.map.addLayer(this.clusterLayer);

    this.registerEvents();
    this.addSedeMarker();
  }

  private addSedeMarker(): void {
    const feature = new Feature({ geometry: sede });

    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        })
      })
    );

    const layer = new VectorLayer({
      source: new VectorSource({ features: [feature] })
    });

    this.map.addLayer(layer);
  }

  private renderMarkers(): void {

    const features: Feature[] = [];
    this.ordiniFiltrati = [];

    for (const e of this.ordini) {

      if (this.selectedVeicolo && e.idVeicolo !== this.selectedVeicolo) {
        continue;
      }

      if (this.selectedFascia && e.oraConsegna !== this.selectedFascia) {
        continue;
      }

      if (!e.latitudine || !e.longitudine) continue;

      this.ordiniFiltrati.push(e);

      features.push(
        new Feature({
          geometry: new Point([e.longitudine, e.latitudine]),
          name: e.intestazione,
          indirizzo: e.indirizzo,
          telefono: e.telefono,
          cellulare: e.cellulare,
          ordine: e.ordine
        })
      );
    }

    const clusterSource = this.clusterLayer.getSource() as Cluster;
    const vectorSource = clusterSource.getSource() as VectorSource;

    vectorSource.clear();
    vectorSource.addFeatures(features);
    if (this.ordiniFiltrati.length === 0) {

      const source = this.routeLayer.getSource();
      if (source) source.clear();

      const optSource = this.optimizedRouteLayer.getSource();
      if (optSource) optSource.clear();

      this.routeStats = {};
      this.optimizedStats = {};
      this.savingStats = {};

      return;

    }
    this.renderRoute();
  }

  private clusterStyle = (feature: any) => {
    const size = feature.get('features').length;
    const features = feature.get('features');
    const ordine = features[0].get('newOrdine') || features[0].get('ordine');
    const key = size === 1 ? `single_${ordine}` : `cluster_${size}`;
    if (!this.styleCache[key]) {
      this.styleCache[key] = new Style({
        image: new CircleStyle({
          radius: size === 1 ? 12 : 14,
          fill: new Fill({
            color: size === 1 ? '#1976d2' : '#455a64'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        }),
        text: new Text({
          text: size === 1 && ordine ? ordine.toString() : size.toString(),
          fill: new Fill({ color: '#fff' }),
          font: 'bold 12px Roboto'
        })
      });
    }
    return this.styleCache[key];
  };

  private registerEvents(): void {

    this.map.on('pointermove', evt => {
      this.map.getTargetElement().style.cursor =
        this.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });

    this.map.on('click', e => {

      this.overlay.setPosition(undefined);

      this.map.forEachFeatureAtPixel(e.pixel, feature => {

        const features = feature.get('features');

        if (!features || features.length === 0) return;

        if (features.length === 1) {

          this.showSinglePopup(features[0], e.coordinate);

        } else {

          const coords: [number, number][] = features.map((f: any) =>
            f.getGeometry().getCoordinates() as [number, number]
          );

          const allSame = coords.every((c: [number, number]) =>
            c[0] === coords[0][0] && c[1] === coords[0][1]
          );
          console.log('features length', features.length);
          console.log('allSame', allSame);
          if (allSame) {
            this.showMultiplePopup(features, e.coordinate);
          } else {
            const extent = boundingExtent(coords);
            this.map.getView().fit(extent, {
              duration: 1000,
              padding: [25, 25, 25, 25]
            });
          }
        }

      });

    });
  }
  private showSinglePopup(feature: any, coordinate: any): void {
    this.popupContent.nativeElement.innerHTML = `
    <div style="font-size:0.75em">
      <strong>${feature.get('name')}</strong><br>
      ${feature.get('indirizzo')}<br>
      tel: ${feature.get('telefono') || '-'}<br>
      cell: ${feature.get('cellulare') || '-'}
    </div>
  `;
    this.overlay.setPosition(coordinate);
  }

  private showMultiplePopup(features: any[], coordinate: any): void {

    const grouped: Record<string, any[]> = {};

    for (const f of features) {

      const key = f.get('sottoConto');

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(f);
    }

    let html = `<div style="font-size:0.8em">`;

    for (const key in grouped) {

      const group = grouped[key];
      const first = group[0];

      html += `
      <div style="margin-bottom:8px;">
        <strong>${first.get('name')}</strong>
        ${group.length > 1 ? `(${group.length} ordini)` : ''}
        <br>
        ${first.get('indirizzo')}<br>
        tel: ${first.get('telefono') || '-'}<br>
        cell: ${first.get('cellulare') || '-'}
      </div>
      <hr>
    `;
    }

    html += `</div>`;

    this.popupContent.nativeElement.innerHTML = html;
    this.overlay.setPosition(coordinate);
  }

  private drawOptimizedRoute(geometry: any) {

    const line = new LineString(geometry.coordinates);

    const feature = new Feature({
      geometry: line
    });

    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#2e7d32',
          width: 4,
          lineDash: [10, 10]
        })
      })
    );

    const source = this.optimizedRouteLayer.getSource();
    if (!source) return;

    source.addFeature(feature);
  }

  private drawRoute(geometry: any, veicolo?: number, fascia?: 'M' | 'P') {

    let color = '#1976d2';

    if (veicolo === 1 && fascia === 'M') color = '#1976d2';
    if (veicolo === 1 && fascia === 'P') color = '#d32f2f';
    if (veicolo === 2 && fascia === 'M') color = '#388e3c';
    if (veicolo === 2 && fascia === 'P') color = '#f57c00';

    const line = new LineString(geometry.coordinates);

    const feature = new Feature({
      geometry: line
    });

    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: color,
          width: 4
        })
      })
    );

    const source = this.routeLayer.getSource();

    if (!source) return;

    source.addFeature(feature);

  }

  private renderRoute() {
    const optSource = this.optimizedRouteLayer.getSource();
    if (optSource) optSource.clear();

    this.optimizedStats = {};
    if (!this.ordiniFiltrati || this.ordiniFiltrati.length === 0) {
      return;
    }

    const groups: any = {};

    for (const o of this.ordiniFiltrati) {

      if (!o.latitudine || !o.longitudine) continue;

      const key = `${o.idVeicolo}_${o.oraConsegna}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(o);
    }

    const source = this.routeLayer.getSource();
    if (source) source.clear();
    this.routeStats = {};
    for (const key in groups) {

      const list = groups[key].sort((a: any, b: any) =>
        (a.ordine || 0) - (b.ordine || 0)
      );

      const coords: string[] = [];

      coords.push(`${sedeLonLat[0]},${sedeLonLat[1]}`);

      for (const o of list) {
        coords.push(`${o.longitudine},${o.latitudine}`);
      }

      coords.push(`${sedeLonLat[0]},${sedeLonLat[1]}`);

      const first = list[0];

      this.service.getRoute(coords).subscribe(json => {

        if (!json?.routes?.length) return;

        const geometry = json.routes[0].geometry;
        const route = json.routes[0];

        this.routeStats[key] = {
          km: route.distance / 1000,
          time: Math.round(route.duration / 60)
        };

        this.drawRoute(
          geometry,
          first.idVeicolo,
          first.oraConsegna
        );

      });

    }

  }

  toggleRoute() {
    const visible = this.routeLayer.getVisible();
    this.routeLayer.setVisible(!visible);
  }

  optimizeRoute() {

    if (!this.ordiniFiltrati || this.ordiniFiltrati.length === 0) {
      return;
    }

    if (this.selectedVeicolo == null || this.selectedFascia == null) {

      this.snackbar.open(
        'Seleziona veicolo e fascia per ottimizzare il percorso',
        'OK',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );

      return;
    }
    this.routeLayer.setVisible(false);
    this.optimizedRouteLayer.setVisible(true);
    const optSource = this.optimizedRouteLayer.getSource();
    if (optSource) optSource.clear();

    this.optimizedStats = {};
    this.savingStats = {};

    const groups: any = {};

    // 🔹 costruzione gruppi (come già fai)
    for (const o of this.ordiniFiltrati) {

      if (!o.latitudine || !o.longitudine) continue;

      const key = `${o.idVeicolo}_${o.oraConsegna}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(o);
    }

    // 🔴 prendo SOLO il gruppo selezionato
    const key = `${this.selectedVeicolo}_${this.selectedFascia}`;
    const list = groups[key];

    if (!list || list.length === 0) {
      return;
    }

    // 🔹 ordinamento attuale
    const sorted = list.sort((a: any, b: any) =>
      (a.ordine || 0) - (b.ordine || 0)
    );

    const coords: string[] = [];

    // partenza sede
    coords.push(`${sedeLonLat[0]},${sedeLonLat[1]}`);

    for (const o of sorted) {
      coords.push(`${o.longitudine},${o.latitudine}`);
    }

    // ritorno sede
    coords.push(`${sedeLonLat[0]},${sedeLonLat[1]}`);

    const first = sorted[0];

    this.service.getOptimizedRoute(coords).subscribe(json => {

      if (!json?.trips?.length) return;

      const route = json.trips[0];
      const geometry = route.geometry;

      // 🔹 stats ottimizzate
      this.optimizedStats[key] = {
        km: route.distance / 1000,
        time: Math.round(route.duration / 60)
      };

      // 🔹 saving rispetto route normale
      if (this.routeStats[key]) {
        this.savingStats[key] = {
          km: this.routeStats[key].km - this.optimizedStats[key].km,
          time: this.routeStats[key].time - this.optimizedStats[key].time
        };
      }

      const waypoints = json.waypoints;

// filtro via sede (primo e ultimo)
      const customerWaypoints = waypoints.filter((w: any, index: number) => {
        return index !== 0 && index !== waypoints.length - 1;
      });

// array risultato
      const optimized: any[] = new Array(customerWaypoints.length);

// mapping corretto
      customerWaypoints.forEach((w: any, index: number) => {
        const newIndex = w.waypoint_index - 1; // 🔴 fondamentale
        optimized[newIndex] = sorted[index];
      });

      this.currentOrder = sorted;
      this.optimizedOrder = optimized.filter(x => x); // pulizia eventuali undefined
      // reset
      this.ordiniFiltrati.forEach(o => o.newOrdine = null);

// assegno nuovo ordine
      this.optimizedOrder.forEach((o: any, index: number) => {
        o.newOrdine = index + 1;
      });

// 🔥 rifaccio i marker
      this.renderMarkers();
      this.drawOptimizedRoute(geometry);

    });
  }


  centerMap() {
    this.map.getView().setCenter(sedeLonLat);
    this.map.getView().setZoom(10);
  }

  setVeicolo(v: number | null) {
    this.selectedVeicolo = v;
    this.renderMarkers();
  }

  setFascia(f: 'M' | 'P' | null) {
    this.selectedFascia = f;
    this.renderMarkers();
  }

  rejectOptimization() {

    // pulisco layer ottimizzato
    const optSource = this.optimizedRouteLayer.getSource();
    if (optSource) optSource.clear();

    // reset dati UI
    this.optimizedOrder = [];
    this.optimizedStats = {};
    this.savingStats = {};
    this.routeLayer.setVisible(true);
    this.optimizedRouteLayer.setVisible(false);

  }

  applyOptimization() {

    if (!this.optimizedOrder || this.optimizedOrder.length === 0) {
      return;
    }

    const result = this.optimizedOrder.map((o: any, index: number) => ({
      anno: o.anno,
      serie: o.serie,
      progressivo: o.progressivo,
      ordine: index + 1
    }));

    this.optimizationApplied.emit(result);

    this.rejectOptimization();

  }

  isChanged(item: any, index: number): boolean {
    const originalIndex = this.currentOrder.findIndex(
      o =>
        o.anno === item.anno &&
        o.serie === item.serie &&
        o.progressivo === item.progressivo
    );

    return originalIndex !== index;
  }
}
