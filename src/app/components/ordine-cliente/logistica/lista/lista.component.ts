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
import {fromLonLat, useGeographic} from "ol/proj";
import {Icon, RegularShape, Style} from 'ol/style.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Feature} from "ol";
import Popup from "ol-popup";
import {SymbolType} from "ol/style/literal";
import TRIANGLE = SymbolType.TRIANGLE;
import {Circle} from "ol/geom";
import {Fill, Stroke} from "ol/style";

useGeographic();

const sedeLonLat = [17.5083, 40.6472];
const sede = new Point(sedeLonLat);
const stroke = new Stroke({color: 'black', width: 2});
const fill = new Fill({color: 'red'});


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
            markerFeatures.push(new Feature({
              geometry: new Point([lon,lat]),
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

          const markerLayer = new VectorLayer({
            source: new VectorSource({
              features: markerFeatures
            }),
          });
          this.map.addLayer(markerLayer);

          const popup = new Popup();
          this.map.addOverlay(popup);

          this.map.on("click", (evt) => {
            const feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
              return feature;
            });
            if (!feature) {
              return;
            }
            let html = "<div style='font-size:0.75em'>" + feature.get("name") + "<br>" +
              feature.get("indirizzo") + "<br>tel:&nbsp;" +
              feature.get("telefono") + "<br>cell:&nbsp" +
              feature.get("cellulare") + "<br>" +
              "</div>";
            popup.show(evt.coordinate, html);
          });

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
