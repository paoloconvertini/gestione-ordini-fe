import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../../services/ordine-cliente/articolo/articolo.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import {HistoryDialogComponent} from "../../history-dialog/history-dialog.component";
import {ConfirmDialogComponent} from "../../confirm-dialog/confirm-dialog.component";
import {OrdineFornitoreService} from "../../../services/ordine-fornitore/list/ordine-fornitore.service";
import {OrdineCliente} from "../../../models/ordine-cliente";
import {FirmaDialogComponent} from "../../firma-dialog/firma-dialog.component";
import {OrdineClienteService} from "../../../services/ordine-cliente/list/ordine-cliente.service";

export interface Option {
  name: string,
  checked: boolean
}

@Component({
  selector: 'app-articolo',
  templateUrl: './articolo.component.html',
  styleUrls: ['./articolo.component.css']
})
export class ArticoloComponent extends CommonListComponent implements OnInit
//  , OnDestroy
{

  //subscription!: Subscription;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  anno: any;
  serie: any;
  progressivo: any;
  status: any;
  filtroArticoli: boolean = false;
  radioOptions: Option[] = [{name: "Da ordinare", checked: true}, {name: "Tutti", checked: false}];
  radioConsegnatoOptions: Option[] = [{name: "Da consegnare", checked: true}, {name: "Tutti", checked: false}];
  radioDaRiservareOptions: Option[] = [{name: "Da riservare", checked: true}, {name: "Tutti", checked: false}];
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo', 'tono',
    'flRiservato', 'flDisponibile', 'flOrdinato', 'flConsegnato', 'azioni'
  ];

  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
      this.anno = params.anno;
      this.serie = params.serie;
      this.progressivo = params.progressivo;
      this.status = params.status;
    });
    if (this.isAmministrativo && this.status === 'DA_ORDINARE') {
      this.filtroArticoli = true;
    }
    /* this.subscription = timer(0, 5000).pipe(
       switchMap( () =>
         this.service.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli)))
       .subscribe(result => console.log(result)
     )*/
    if (this.status === 'COMPLETO') {
      this.filtroConsegnati = true;
    }
    if(this.status === 'INCOMPLETO' && this.isMagazziniere) {
      this.filtroDaRiservare = true;
    }
    this.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli, this.filtroConsegnati, this.filtroDaRiservare);
  }

  constructor(private ordineService: OrdineClienteService, private ordineFornitoreService: OrdineFornitoreService, service: ArticoloService, dialog: MatDialog, snackbar: MatSnackBar, route:Router, private router: ActivatedRoute) {
    super(service, dialog, snackbar, route);
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

  /*ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }*/

  salvaOrdine() {
    this.updateArticoli(this.anno, this.serie, this.progressivo, this.dataSource.filteredData, this.filtroArticoli);
  }

  showHistory(articolo: any) {
    this.dialog.open(HistoryDialogComponent, {
      width: '65%',
      data: articolo,
      autoFocus: false,
      maxHeight: '90vh' //you can adjust the value as per your view
    });
  }

  chiudiOrdine() {
    this.openConfirmDialog(null, null);
  }

  override openConfirmDialog(extraProp: any, preProp: any) {
    let msg = '';
    if (preProp) {
      msg += preProp;
    }
    msg += 'Sei sicuro di aver processato correttamente tutti gli articoli';
    if (extraProp) {
      msg += " ";
      msg += extraProp;
    }
    msg += '?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {msg: msg},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chiudi(this.dataSource.filteredData).subscribe({
          next: (res) => {
            if (!res.error) {
              let url = '/ordini-clienti';
              if (res.msg) {
                url += '/' + res.msg;
              }
              this.route.navigate([url]);
            }
          },
          error: (e) => console.error(e)
        });
      }
    });
  }

  checkFlags(articolo: any, from: number) {
    if(from === 1) {
      if(articolo.geFlagNonDisponibile) {
        articolo.geFlagNonDisponibile = false;
      }
    } else if(from === 2){
      if(articolo.geFlagRiservato) {
        articolo.geFlagRiservato = false;
      }
    }
  }

  apriFirma() {
    let ordineId = this.anno + '_' +
      this.serie + '_' + this.progressivo;
    {
      const dialogRef = this.dialog.open(FirmaDialogComponent, {
        width: '30%'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let data = new FormData();
          data.append('file', result);
          data.append('orderId', ordineId);
          this.loader = true;
          this.ordineService.upload(data).subscribe({
            next: (res) => {
              this.loader = false;
              if (res && !res.error) {
                this.snackbar.open('Ordine firmato. Puoi trovare il pdf nella cartella condivisa', 'Chiudi', {
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                })
              }
              this.route.navigate(['/ordini-clienti']);
            },
            error: (e) => {
              console.error(e);
              this.snackbar.open('Errore! Firma non creata', 'Chiudi', {
                duration: 2000, horizontalPosition: 'center', verticalPosition: 'top'
              })
              this.loader = false;
            }
          });
        }
      });
    }
  }

  creaOrdineForn() {
    this.loader = true;
    this.ordineFornitoreService.creaOrdineFornitori(this.anno, this.serie, this.progressivo).subscribe({
      next: (res) => {
        this.loader = false;
        if(res) {
          this.snackbar.open(res.msg, 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.route.navigate(['/ordini-clienti', 'DA_ORDINARE']);
        } else if(res.error) {
          this.snackbar.open(res.msg, 'Chiudi', {
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
        }
      },
      error: () => {
        this.snackbar.open('Errore!', 'Chiudi', {
          duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
        });
        this.loader = false;
      }
    })
  }

}