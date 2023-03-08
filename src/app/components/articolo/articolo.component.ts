import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../commonListComponent";
import {MatDialog} from "@angular/material/dialog";
import {ArticoloService} from "../../services/articolo/articolo.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {HistoryDialogComponent} from "../history-dialog/history-dialog.component";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";

export interface Option {
  name: string,
  checked: boolean
}

@Component({
  selector: 'app-articolo',
  templateUrl: './articolo.component.html',
  styleUrls: ['./articolo.component.css']
})
export class ArticoloComponent extends CommonListComponent implements OnInit{

  ngOnInit(): void {
    this.router.params.subscribe((params: any) => {
        this.anno = params.anno;
        this.serie = params.serie;
        this.progressivo = params.progressivo;
        this.status = params.status;
    });
    if(this.isAmministrativo) {
      this.filtroArticoli = true;
    }
    this.getArticoliByOrdineId(this.anno, this.serie, this.progressivo, this.filtroArticoli);
  }

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  anno: any;
  serie: any;
  progressivo: any;
  status: any;
  filtroArticoli: boolean = false;
  radioOptions: Option[] = [{name: "Da ordinare", checked: true}, {name:"Tutti", checked: false}];
  displayedColumns: string[] = ['codice', 'descrizione', 'quantita', 'prezzo', 'tono',
    'flRiservato', 'flDisponibile', 'flOrdinato', 'flConsegnato', 'azioni'
  ];
  constructor(service: ArticoloService, dialog: MatDialog, snackbar: MatSnackBar, private router: ActivatedRoute, private route: Router) {
    super(service, dialog, snackbar);
    if(localStorage.getItem(environment.ADMIN)) {
      this.isAdmin = true;
    }
    if(localStorage.getItem(environment.MAGAZZINIERE)) {
      this.isMagazziniere = true;
    }
    if(localStorage.getItem(environment.AMMINISTRATIVO)) {
      this.isAmministrativo = true;
    }
    if(localStorage.getItem(environment.VENDITORE)) {
      this.isVenditore = true;
    }
  }

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

  openConfirmDialog(extraProp: any, preProp: any) {
    let msg = '';
    if(preProp) {
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
        this.chiudi(this.anno, this.serie, this.progressivo).subscribe({
          next: (res) => {
            if (!res.error) {
              let url = '/ordini-clienti';
              if(res.msg) {
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
}
