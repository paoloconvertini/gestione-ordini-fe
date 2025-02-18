import {Component, OnInit} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {ActivatedRoute, Router} from "@angular/router";
import {ViewportScroller} from "@angular/common";
import {ScrollPositionService} from "../../services/scroll-position.service";
import {AuthService} from "../../services/auth/auth.service";
import {EmailService} from "../../services/email/email.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {environment} from "../../../environments/environment";
import {FiltroOrdini} from "../../models/FiltroOrdini";
import {ListaService} from "../../services/ordine-cliente/logistica/lista.service";
import {ConsegneSettimanali} from "../../models/ConsegneSettimanali";
import {ArticoloService} from "../../services/ordine-cliente/articolo/articolo.service";
import {
  ConsegneSettimanaliDettaglioDialogComponent
} from "../consegne-settimanali-dettaglio-dialog/consegne-settimanali-dettaglio-dialog.component";
import {NotaConsegna} from "../../models/NotaConsegna";
import {NotaConsegnaService} from "../../services/nota-consegna/nota-consegna.service";
const moment = require('moment');

@Component({
  selector: 'app-consegne-settimanali',
  templateUrl: './consegne-settimanali.component.html',
  styleUrls: ['./consegne-settimanali.component.css']
})
export class ConsegneSettimanaliComponent extends BaseComponent implements OnInit{

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  loader = false;
  filtro: FiltroOrdini = new FiltroOrdini();
  user: any;
  consegne: ConsegneSettimanali = new ConsegneSettimanali();
  notaConsegnaLun: NotaConsegna = new NotaConsegna();
  notaConsegnaMar: NotaConsegna = new NotaConsegna();
  notaConsegnaMer: NotaConsegna = new NotaConsegna();
  notaConsegnaGiov: NotaConsegna = new NotaConsegna();
  notaConsegnaVen: NotaConsegna = new NotaConsegna();
  notaConsegnaSab: NotaConsegna = new NotaConsegna();

  constructor(    private notaConsegnaService: NotaConsegnaService, private router: Router,
                  private viewportScroller: ViewportScroller,
                  private scrollPositionService: ScrollPositionService,
                  private authService: AuthService, private activatedRoute: ActivatedRoute,
                  private emailService: EmailService, private service: ListaService,
                  private articoloService: ArticoloService,
                  private dialog: MatDialog, private snackbar: MatSnackBar, private route: Router) {
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
    this.retrieveList();
    this.user = localStorage.getItem(environment.USERNAME);
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getConsegneSettimanali(this.filtro).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.consegne = data;
          if(this.consegne.lunedi.consegne && this.consegne.lunedi.consegne.length > 0) {
            this.getNotaConsegna( this.consegne.lunedi.consegne[0].dataConsegna, 1);
          }
          if(this.consegne.martedi.consegne && this.consegne.martedi.consegne.length > 0) {
            this.getNotaConsegna( this.consegne.martedi.consegne[0].dataConsegna, 2);
          }

          if(this.consegne.mercoledi.consegne && this.consegne.mercoledi.consegne.length > 0) {
            this.getNotaConsegna( this.consegne.mercoledi.consegne[0].dataConsegna, 3);
          }

          if(this.consegne.giovedi.consegne && this.consegne.giovedi.consegne.length > 0) {
            this.getNotaConsegna( this.consegne.giovedi.consegne[0].dataConsegna, 4);
          }

          if(this.consegne.venerdi.consegne && this.consegne.venerdi.consegne.length > 0) {
            this.getNotaConsegna( this.consegne.venerdi.consegne[0].dataConsegna, 5);
          }
          if(this.consegne.sabato.consegne && this.consegne.sabato.consegne.length > 0) {
            this.getNotaConsegna( this.consegne.sabato.consegne[0].dataConsegna, 6);
          }
          this.loader = false;
        }
      })
  }


  getNotaConsegna(date: any, giorno:number): void {
    date = moment(date);
    let data = date.format('DDMMyyyy');
    this.notaConsegnaService.getNota(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (data: any) => {
        switch (giorno) {
          case 1: {
            if(data) {
              this.notaConsegnaLun = data;
            } else {
              this.notaConsegnaLun = new NotaConsegna();
            }
            break;
          }
          case 2: {
            if(data) {
              this.notaConsegnaMar = data;
            } else {
              this.notaConsegnaMar = new NotaConsegna();
            }
            break;
          }
          case 3: {
            if(data) {
              this.notaConsegnaMer = data;
            } else {
              this.notaConsegnaMer = new NotaConsegna();
            }
            break;
          }
          case 4: {
            if(data) {
              this.notaConsegnaGiov = data;
            } else {
              this.notaConsegnaGiov = new NotaConsegna();
            }
            break;
          }
          case 5: {
            if(data) {
              this.notaConsegnaVen = data;
            } else {
              this.notaConsegnaVen = new NotaConsegna();
            }
            break;
          }
          case 6: {
            if(data) {
              this.notaConsegnaSab = data;
            } else {
              this.notaConsegnaSab = new NotaConsegna();
            }
            break;
          }
        }

      }
    })
  }

  dettaglio(consegna: any) {
    this.dialog.open(ConsegneSettimanaliDettaglioDialogComponent, {
      width: '90%',
      data: consegna,
      autoFocus: false,
      maxHeight: '90vh' //you can adjust the value as per your view
    });

  }

}
