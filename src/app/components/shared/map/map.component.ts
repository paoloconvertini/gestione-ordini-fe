import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';

import OlMap from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Cluster, Vector as VectorSource} from 'ol/source';
import {Point} from 'ol/geom';
import {Feature} from 'ol';
import {Fill, Stroke, Style, Text} from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import {useGeographic} from 'ol/proj';
import {boundingExtent} from 'ol/extent';
import Overlay from 'ol/Overlay';

useGeographic();

const sedeLonLat = [17.5083, 40.6472];
const sede = new Point(sedeLonLat);

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {

  @Input() ordini: any[] = [];

  private map!: OlMap;
  private clusterLayer!: VectorLayer<VectorSource>;
  @ViewChild('popup') popupElement!: ElementRef;
  @ViewChild('popupContent') popupContent!: ElementRef;

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

    for (const e of this.ordini) {
      if (!e.latitudine || !e.longitudine) continue;

      features.push(
        new Feature({
          geometry: new Point([e.longitudine, e.latitudine]),
          name: e.intestazione,
          indirizzo: e.indirizzo,
          telefono: e.telefono,
          cellulare: e.cellulare
        })
      );
    }

    const clusterSource = this.clusterLayer.getSource() as Cluster;
    const vectorSource = clusterSource.getSource() as VectorSource;

    vectorSource.clear();
    vectorSource.addFeatures(features);
  }

  private styleCache: any = {};

  private clusterStyle = (feature: any) => {
    const size = feature.get('features').length;

    if (!this.styleCache[size]) {
      this.styleCache[size] = new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: '#3399CC' }),
          stroke: new Stroke({ color: '#fff' })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({ color: '#fff' })
        })
      });
    }
    return this.styleCache[size];
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
}
