import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {takeUntil} from "rxjs";
import {Acconto} from "../../../../models/Acconto";
import {CommonListComponent} from "../../../commonListComponent";
import {AuthService} from "../../../../services/auth/auth.service";
import {environment} from "../../../../../environments/environment";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ArticoloService} from "../../../../services/ordine-cliente/articolo/articolo.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {BaseComponent} from "../../../baseComponent";

@Component({
  selector: 'app-fido-cliente',
  templateUrl: './fido-cliente.component.html',
  styleUrls: ['./fido-cliente.component.css']
})
export class FidoClienteComponent extends BaseComponent implements OnInit {

  @Input() contoCliente: any;
  @Input() mostraSituazioneCliente: boolean = true;
  sottoConto: any;
  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  loaderAcconti: boolean = false;
  loaderSaldoContabile: boolean = false;
  loaderOrdiniAperti: boolean = false;
  loaderAccontiFatturati: boolean = false;
  loaderBolleNonFatturate: boolean = false;
  acconti: Acconto[] = [];
  ordiniAperti: number = 0;
  saldoContabile: number = 0;
  accontiFatturati: number = 0;
  bolleNonFatturate: number = 0;

  constructor(private authService: AuthService, private snackbar: MatSnackBar,  private articoloService: ArticoloService,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    super();
    if(localStorage.getItem(environment.LOGISTICA)){
      this.isLogistica = true;
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
    const raw = this.data?.sottoConto ?? this.contoCliente;
    this.sottoConto = this.normalizeSottoConto(raw);
    this.mostraAcconti();
  }

  private normalizeSottoConto(v: any): string | number {
    if (v == null) return '';              // o gestisci diversamente
    if (typeof v === 'object') {
      return v.sottoConto ?? v.codice ?? v.id ?? '';
    }
    return v; // string | number
  }

  mostraAcconti() {
      this.loaderAcconti = true;
      this.articoloService.getAcconti(this.sottoConto).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (data: Acconto[]) => {
            if (data) {
              this.acconti = data;
            }
            this.loaderAcconti = false;
            if (this.mostraSituazioneCliente) {
              this.getSaldoContabile();
              this.getOrdiniAperti();
              this.getAccontiFatturati();
              this.getBolleNonFatturate();
            }
          },
          error: () => {this.loaderAcconti = false; this.acconti = []}
        })
  }

  getSaldoContabile() {
    this.loaderSaldoContabile = true;
    this.articoloService.getSaldoContabile(this.sottoConto).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: number) => {
          if (data) {
            this.saldoContabile = data;
          }
          this.loaderSaldoContabile = false;
        },
        error: () => {this.loaderSaldoContabile = false;}
      })
  }

  getOrdiniAperti() {
    this.loaderOrdiniAperti = true;
    this.articoloService.getOrdiniAperti(this.sottoConto).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: number) => {
          if (data) {
            this.ordiniAperti = data;
          }
          this.loaderOrdiniAperti = false;
        },
        error: () => {this.loaderOrdiniAperti = false;}
      })
  }

  getAccontiFatturati() {
    this.loaderAccontiFatturati = true;
    this.articoloService.getAccontiFatturati(this.sottoConto).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: number) => {
          if (data) {
            this.accontiFatturati = data;
          }
          this.loaderAccontiFatturati = false;
        },
        error: () => {this.loaderAccontiFatturati = false;}
      })
  }

  getBolleNonFatturate() {
    this.loaderBolleNonFatturate = true;
    this.articoloService.getBolleNonFatturate(this.sottoConto).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: number) => {
          if (data) {
            this.bolleNonFatturate = data;
          }
          this.loaderBolleNonFatturate = false;
        },
        error: () => {this.loaderBolleNonFatturate = false;}
      })
  }
}
