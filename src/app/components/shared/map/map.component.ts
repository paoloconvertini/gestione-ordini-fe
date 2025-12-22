import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import OlMap from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, Cluster } from 'ol/source';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Fill, Stroke, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { useGeographic } from 'ol/proj';
import Popup from 'ol-popup';
import { boundingExtent } from 'ol/extent';

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
  private popup!: Popup;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ordini'] && this.map) {
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

    if (this.clusterLayer) {
      this.map.removeLayer(this.clusterLayer);
    }

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

    const source = new VectorSource({ features });

    const clusterSource = new Cluster({
      distance: 10,
      source
    });

    this.clusterLayer = new VectorLayer({
      source: clusterSource,
      style: this.clusterStyle
    });

    this.map.addLayer(this.clusterLayer);
    this.registerEvents();
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
    this.popup = new Popup();

    this.map.on('pointermove', evt => {
      this.map.getTargetElement().style.cursor =
        this.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
    });

    this.map.on('click', e => {
      this.map.getOverlays().clear();

      this.map.forEachFeatureAtPixel(e.pixel, feature => {
        const features = feature.get('features');

        if (features.length === 1) {
          const f = features[0];
          this.popup.show(e.coordinate, `
            <div style="font-size:0.75em">
              ${f.get('name')}<br>
              ${f.get('indirizzo')}<br>
              tel: ${f.get('telefono')}<br>
              cell: ${f.get('cellulare')}
            </div>
          `);
          this.map.addOverlay(this.popup);
        } else {
          const extent = boundingExtent(
            features.map((r: any) => r.getGeometry().getCoordinates())
          );
          this.map.getView().fit(extent, {
            duration: 1000,
            padding: [25, 25, 25, 25]
          });
        }
      });
    });
  }
}
