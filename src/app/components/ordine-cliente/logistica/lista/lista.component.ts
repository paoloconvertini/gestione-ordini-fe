import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../../commonListComponent";
import {AuthService} from "../../../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EmailService} from "../../../../services/email/email.service";
import {OrdineClienteService} from "../../../../services/ordine-cliente/list/ordine-cliente.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {environment} from "../../../../../environments/environment";
import {ListaService} from "../../../../services/ordine-cliente/logistica/lista.service";
import {FiltroOrdini} from "../../../../models/FiltroOrdini";
import {OrdineCliente} from "../../../../models/ordine-cliente";
import {OrdineClienteNotaDto} from "../../../../models/OrdineClienteNotaDto";
import {
  OrdineClienteNoteDialogComponent
} from "../../../ordine-cliente-note-dialog/ordine-cliente-note-dialog.component";
import {Option} from "../../ordine-cliente-list/ordine-cliente.component";
import {ArticoloCliente} from "../../../../models/ArticoloCliente";
import {ArticoloService} from "../../../../services/ordine-cliente/articolo/articolo.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {useGeographic} from "ol/proj";
import {Icon, Style, Text} from 'ol/style.js';
import {Cluster, Vector as VectorSource} from 'ol/source.js';
import {LineString, Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Feature} from "ol";
import {GeoJSON} from "ol/format";
import {Fill, Stroke} from "ol/style";
import CircleStyle from "ol/style/Circle";

useGeographic();

const sedeLonLat = [17.5083, 40.6472];
const sede = new Point(sedeLonLat);
const circleDistanceMultiplier = 1;
const circleFootSeparation = 28;
const circleStartAngle = Math.PI / 2;

const convexHullFill = new Fill({
  color: 'rgba(255, 153, 0, 0.4)',
});
const convexHullStroke = new Stroke({
  color: 'rgba(204, 85, 0, 1)',
  width: 1.5,
});
const outerCircleFill = new Fill({
  color: 'rgba(255, 153, 102, 0.3)',
});
const innerCircleFill = new Fill({
  color: 'rgba(255, 165, 0, 0.7)',
});
const textFill = new Fill({
  color: '#fff',
});
const textStroke = new Stroke({
  color: 'rgba(0, 0, 0, 0.6)',
  width: 3,
});
const innerCircle = new CircleStyle({
  radius: 14,
  fill: innerCircleFill,
});
const outerCircle = new CircleStyle({
  radius: 20,
  fill: outerCircleFill,
});
const darkIcon = new Icon({
  src: 'data/icons/emoticon-cool.svg',
});
const lightIcon = new Icon({
  src: 'data/icons/emoticon-cool-outline.svg',
});
let clickFeature: any;
let clickResolution: any;
let hoverFeature:any;


@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListaComponent extends CommonListComponent implements OnInit {

  displayedColumns: string[] = ['numero', 'cliente', 'localita', 'data', 'status', 'azioni'];
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  filtro: FiltroOrdini = new FiltroOrdini();
  radioPerVenditoreOptions: Option[] = [];
  stato: string = '';
  loaderDettaglio: boolean = false;
  expandedElement: any;
  articoli: ArticoloCliente[] = [];
  showMappa: boolean = false;
  map: Map = new Map();

  constructor(private authService: AuthService, private router: ActivatedRoute,
              private emailService: EmailService, private service: ListaService,
              private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router,
              private ordineClienteService: OrdineClienteService,  private articoloService: ArticoloService) {
    super();
    if (localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    if (localStorage.getItem(environment.MAGAZZINIERE)) {
      this.isMagazziniere = true;
    }
    if (localStorage.getItem(environment.AMMINISTRATIVO)) {
      this.isAmministrativo = true;
    }
    if (localStorage.getItem(environment.VENDITORE)) {
      this.isVenditore = true;
    }
    if (localStorage.getItem(environment.LOGISTICA)) {
      this.isLogistica = true;
    }
  }

  ngOnInit(): void {
    this.getVenditori();
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 100);
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  getVenditori(): void {
    let data = [];
    data.push('Venditore');
    this.authService.getVenditori(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data) => {
        this.radioPerVenditoreOptions = data;
      },
      error: (e: any) => {
        console.error(e);
      }

    })
  }

  refreshPage() {
    this.getVenditori();
    this.retrieveList();
  }

  editDettaglio(ordine: OrdineCliente) {
    let url = "/articoli/edit/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (ordine.status) {
      url += "/" + ordine.status;
    }
    this.route.navigateByUrl(url);
  }

  vediDettaglio(ordine: OrdineCliente) {
    let url = "/articoli/view/" + ordine.anno + "/" + ordine.serie + "/" + ordine.progressivo;
    if (ordine.status) {
      url += "/" + ordine.status;
    }
    this.route.navigateByUrl(url);
  }

  aggiungiNote(ordine: OrdineCliente) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    data.note = ordine.note;
    {
      const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
        width: '50%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loader = true;
          this.ordineClienteService.addNotes(result).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                  ordine.note = result.note;
                }
              },
              error: (e) => {
                console.error(e);
                this.snackbar.open('Errore! Nota non creata', 'Chiudi', {
                  duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
                })
                this.loader = false;
              }
            });
        }
      });
    }
  }

  downloadOrdine(ordine: OrdineCliente) {
    this.ordineClienteService.download(ordine);
  }

  cercaBolle() {
    if (this.isVenditore || this.isAdmin) {
      this.getVenditori();
    }
    this.loader = true;
    this.ordineClienteService.cercaBolle().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 100);
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  getArticoli(ordine: OrdineCliente) {
    this.loaderDettaglio = true;
    this.articoloService.getArticoli(ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: ArticoloCliente[]) => {
          if (data) {
            this.articoli = data;
          }
          this.loaderDettaglio = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loaderDettaglio = false;
        }
      })
  }

  mostraMappa() {
        this.showMappa = !this.showMappa;
        if(this.showMappa){
          this.map.setView(new View({
              center: sedeLonLat,
              zoom:9,
            })
          );
          this.map.setLayers([
            new TileLayer({
              source: new OSM(),
            }),
          ]);
          this.map.setTarget('map');

          const iconFeature = new Feature({
            geometry: sede,
            name: 'Null Island',
            population: 4000,
            rainfall: 500,
          });

          const iconStyle = new Style({
            image: new Icon({
              anchor: [0, 0],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/assets/logo-copy.png',
            }),
          });

          iconFeature.setStyle(iconStyle);

          const vectorSource = new VectorSource({
            features: [iconFeature],
          });

          const vectorLayer = new VectorLayer({
            source: vectorSource,
          });

          this.map.addLayer(vectorLayer);


          const vectorSourcePhoto = new VectorSource({
            format: new GeoJSON(),
            url: 'data/geojson/photovoltaic.json',
          });

          const clusterSource = new Cluster({
            attributions:
              'Data: <a href="https://www.data.gv.at/auftritte/?organisation=stadt-wien">Stadt Wien</a>',
            distance: 35,
            source: vectorSourcePhoto,
          });


// Layer displaying the clusters and individual features.
          const clusters = new VectorLayer({
            source: clusterSource,
            style: clusterStyle,
          });

// Layer displaying the expanded view of overlapping cluster members.
          const clusterCircles = new VectorLayer({
            source: clusterSource,
            style: clusterCircleStyle,
          });




          function clusterStyle(feature:any) {
            const size = feature.get('features').length;
            if (size > 1) {
              return [
                new Style({
                  image: outerCircle,
                }),
                new Style({
                  image: innerCircle,
                  text: new Text({
                    text: size.toString(),
                    fill: textFill,
                    stroke: textStroke,
                  }),
                }),
              ];
            }
            const originalFeature = feature.get('features')[0];
            return clusterMemberStyle(originalFeature);
          }

          /**
           * From
           * https://github.com/Leaflet/Leaflet.markercluster/blob/31360f2/src/MarkerCluster.Spiderfier.js#L55-L72
           * Arranges points in a circle around the cluster center, with a line pointing from the center to
           * each point.
           * @param {number} count Number of cluster members.
           * @param {Array<number>} clusterCenter Center coordinate of the cluster.
           * @param {number} resolution Current view resolution.
           * @return {Array<Array<number>>} An array of coordinates representing the cluster members.
           */
          function generatePointsCircle(count: any, clusterCenter:any, resolution:any) {
            const circumference =
              circleDistanceMultiplier * circleFootSeparation * (2 + count);
            let legLength = circumference / (Math.PI * 2); //radius from circumference
            const angleStep = (Math.PI * 2) / count;
            const res = [];
            let angle;

            legLength = Math.max(legLength, 35) * resolution; // Minimum distance to get outside the cluster icon.

            for (let i = 0; i < count; ++i) {
              // Clockwise, like spiral.
              angle = circleStartAngle + i * angleStep;
              res.push([
                clusterCenter[0] + legLength * Math.cos(angle),
                clusterCenter[1] + legLength * Math.sin(angle),
              ]);
            }

            return res;
          }

          /**
           * Single feature style, users for clusters with 1 feature and cluster circles.
           * @param {Feature} clusterMember A feature from a cluster.
           * @return {Style} An icon style for the cluster member's location.
           */
          function clusterMemberStyle(clusterMember: any) {
            return new Style({
              geometry: clusterMember.getGeometry(),
              image: clusterMember.get('LEISTUNG') > 5 ? darkIcon : lightIcon,
            });
          }


          /**
           * Style for clusters with features that are too close to each other, activated on click.
           * @param {Feature} cluster A cluster with overlapping members.
           * @param {number} resolution The current view resolution.
           * @return {Style|null} A style to render an expanded view of the cluster members.
           */
          function clusterCircleStyle(cluster: any, resolution: any):any {
            if (cluster !== clickFeature || resolution !== clickResolution) {
              return null;
            }
            const clusterMembers = cluster.get('features');
            const centerCoordinates = cluster.getGeometry().getCoordinates();
            return generatePointsCircle(
              clusterMembers.length,
              cluster.getGeometry().getCoordinates(),
              resolution
            ).reduce((styles, coordinates, i) => {
              const point = new Point(coordinates);
              const line = new LineString([centerCoordinates, coordinates]);
              styles.unshift(
                new Style({
                  geometry: line,
                  stroke: convexHullStroke,
                })
              );
              styles.push(
                clusterMemberStyle(
                  new Feature({
                    ...clusterMembers[i].getProperties(),
                    geometry: point,
                  })
                )
              );
              return styles;
            }, []);
          }

          this.map.addLayer(clusters);
          this.map.addLayer(clusterCircles);
          this.map.render();
        }
  }

  mostraNonDisponibile(articolo:any):number {
    if( articolo.tipoRigo !== '' && articolo.tipoRigo !== ' ') {
      return 2;
    } else if(articolo.flagNonDisponibile || (articolo.flagOrdinato && !articolo.flagRiservato)) {
      return 1;
    } else {
      return 0;
    }
  }
}
