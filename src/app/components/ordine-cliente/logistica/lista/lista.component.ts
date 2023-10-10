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
import {Option, OptStatus} from "../../ordine-cliente-list/ordine-cliente.component";
import {ArticoloCliente} from "../../../../models/ArticoloCliente";
import {ArticoloService} from "../../../../services/ordine-cliente/articolo/articolo.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import {useGeographic} from "ol/proj";
import {Icon, RegularShape, Style} from 'ol/style.js';
import {Cluster, Vector as VectorSource} from 'ol/source.js';
import {Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Feature} from "ol";
import Popup from "ol-popup";
import {Fill, Stroke, Text} from "ol/style";
import {boundingExtent} from 'ol/extent.js';
import CircleStyle from "ol/style/Circle";
import {VeicoloService} from "../../../../services/ordine-cliente/veicolo/veicolo.service";


useGeographic();

const sedeLonLat = [17.5083, 40.6472];
const sede = new Point(sedeLonLat);
const stroke = new Stroke({color: 'black', width: 2});
const fill = new Fill({color: 'red'});


export interface VStatus {
  id: any,
  descrizione: string
}

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
  radioPerStatusOptions: OptStatus[] = [{codice: 'TUTTI', descrizione: 'TUTTI'}, {codice: 'INCOMPLETO', descrizione: 'INCOMPLETO'},
    {codice: 'COMPLETO', descrizione: 'COMPLETO'}];
  stato: string = '';
  loaderDettaglio: boolean = false;
  expandedElement: any;
  articoli: ArticoloCliente[] = [];
  showMappa: boolean = false;
  map: Map = new Map();
  selectStatusOptions: VStatus[] = [];


  constructor(private authService: AuthService, private router: ActivatedRoute,
              private emailService: EmailService, private service: ListaService,
              private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router,
              private ordineClienteService: OrdineClienteService,  private articoloService: ArticoloService,  private veicoloService: VeicoloService) {
    super();
    if(localStorage.getItem(environment.LOGISTICA)){
      this.filtro.status = 'COMPLETO';
      this.isLogistica = true;
    } else {
      this.filtro.status = 'TUTTI';
    }
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
  }

  ngOnInit(): void {
    this.getVeicoli();
    this.getVenditori();
    this.retrieveList();
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any[] | undefined) => {
          this.createPaginator(data, 100);
          if(this.filtro.searchText){
            this.applyFilter();
          }
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
    this.loader = true;
    this.ordineClienteService.aggiornaLista().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.retrieveList();
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  aggiungiNote(ordine: OrdineCliente, from: number) {
    let data: OrdineClienteNotaDto = new OrdineClienteNotaDto();
    data.anno = ordine.anno;
    data.serie = ordine.serie;
    data.progressivo = ordine.progressivo;
    if(from === 0) {
      data.note = ordine.note;
    } else {
      if(!this.isLogistica && !this.isAdmin) {
        return;
      }
      data.note = ordine.noteLogistica;
    }
    {
      const dialogRef = this.dialog.open(OrdineClienteNoteDialogComponent, {
        width: '50%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loader = true;
          this.ordineClienteService.addNotes(result, from).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                this.loader = false;
                if (res && !res.error) {
                  this.snackbar.open(res.msg, 'Chiudi', {
                    duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                  })
                  if(from === 0) {
                    ordine.note = result.note;
                  } else {
                    ordine.noteLogistica = result.note;
                  }
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
    if(this.expandedElement === ordine){
      return;
    }
    this.loaderDettaglio = true;
    this.articoloService.getArticoli("N", ordine.anno, ordine.serie, ordine.progressivo).pipe(takeUntil(this.ngUnsubscribe))
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

          const markerFeatures = []
          for (let e of this.dataSource.filteredData) {
            // @ts-ignore
            let lon = e.longitudine;
            // @ts-ignore
            let lat = e.latitudine;
            // @ts-ignore
            let name = e.intestazione;
            // @ts-ignore
            let cellulare = e.cellulare;
            // @ts-ignore
            let telefono = e.telefono;
            // @ts-ignore
            let indirizzo = e.indirizzo;
            // @ts-ignore
            let sottoConto= e.sottoConto;
            markerFeatures.push(new Feature({
              geometry: new Point([lon,lat]),
              id:sottoConto,
              name:  name,
              telefono: telefono,
              indirizzo: indirizzo,
              cellulare: cellulare
            }));
          }

          const markerStyle = new Style({
            image: new RegularShape({
            fill: fill,
            stroke: stroke,
            points: 3,
            radius: 10,
            angle: 0
          })});
          markerFeatures.forEach(m => m.setStyle(markerStyle));

          const source = new VectorSource({
            features: markerFeatures,
          });

          const clusterSource = new Cluster({
            distance:  10,
            minDistance:10,
            source: source
          });

          const styleCache:any = {};
          function getStyle (feature:any) {
            const size = feature.get('features').length;
            let style = styleCache[size];
            if (!style) {
              style = new Style({
                image: new CircleStyle({
                  radius: 10,
                  stroke: new Stroke({
                    color: '#fff',
                  }),
                  fill: new Fill({
                    color: '#3399CC',
                  }),
                }),
                text: new Text({
                  text: size.toString(),
                  fill: new Fill({
                    color: '#fff',
                  }),
                }),
              });
              styleCache[size] = style;
            }
            return style;
          }

          const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: getStyle
          });

          this.map.addLayer(clusterLayer);

          let popup = new Popup();

          this.map.on('pointermove', (evt) => {
            this.map.getTargetElement().style.cursor =
              this.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
          });

          this.map.on('click', (e) => {
            this.map.getOverlays().clear();
            let markers:any = [];
            this.map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
              if (feature.get('features').length > 1) {
                let lat:any = feature.get('features')[0].getGeometry().getFlatCoordinates()[1];
                let lon:any = feature.get('features')[0].getGeometry().getFlatCoordinates()[0];
                let id:any =  feature.get('features')[0].get("id");
                let feat:any = feature.get('features')[0];
                markers.push(feat);
                if(feature.get("expanded") === true){
                  return;
                }
                for(let f of feature.get('features')){
                  if(f.get("id") === id) {
                    continue;
                  }
                  if(lat !== f.getGeometry().getFlatCoordinates()[1]) {
                    break;
                  } else if(lon !== f.getGeometry().getFlatCoordinates()[0]) {
                    break;
                  } else {
                    markers.push(f);
                  }

                }
                if(markers.length > 1) {
                  for(let f of markers) {
                    let coords = [f.getGeometry().getFlatCoordinates()[0] + Math.random()/100,
                      f.getGeometry().getFlatCoordinates()[1]];
                    popup = new Popup();
                    popup.show(coords, this.generateHtmlPopup(f));
                    this.map.addOverlay(popup);
                  }
                } else {
                  const extent = boundingExtent(
                    feature.get("features").map((r:any) => r.getGeometry().getCoordinates())
                  );
                  this.map.getView().fit(extent, {duration: 1000, padding: [25, 25, 25, 25]});
                }
              } else {
                const feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature) {
                  return feature.get("features")[0];
                });
                if (!feature) {
                  return;
                }
                popup.show(e.coordinate, this.generateHtmlPopup(feature));
                this.map.addOverlay(popup);
              }
            });
          });
        }
  }

  generateHtmlPopup(feature:any): string {
   return "<div style='font-size:0.75em'>" + feature.get("name") + "<br>" +
      feature.get("indirizzo") + "<br>tel:&nbsp;" +
      feature.get("telefono") + "<br>cell:&nbsp" +
      feature.get("cellulare") + "<br>" +
      "</div>";
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


  getVeicoli() {
    //this.loader = true;
    this.veicoloService.getVeicoli().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.selectStatusOptions = data;
          }
         // this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          //this.loader= false;
        }
      })
  }


  update(articolo: any): void {
    this.articoloService.updateVeicolo(articolo).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          if (!res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              duration: 1000, horizontalPosition: 'center', verticalPosition: 'top'
            })
          }
        },
        error: (e) => {
          console.error(e);
          this.snackbar.open('Errore veicolo non salvato', 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          })
        }
      });
  }


  override applyFilter() {
    super.applyFilter(this.filtro.searchText);
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      return (
        data.intestazione.toLowerCase().includes(filter)
        || data.serie.toLowerCase().includes(filter)
        || data.dataConferma.includes(filter)
        || data.localita.toLowerCase().includes(filter)
        || data.anno.toString().toLowerCase().includes(filter)
        || data.progressivo.toString().toLowerCase().includes(filter)
      )
    }
  }
}
