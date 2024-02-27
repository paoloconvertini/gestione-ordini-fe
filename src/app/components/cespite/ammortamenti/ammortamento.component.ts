import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {AuthService} from "../../../services/auth/auth.service";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {map, Observable, startWith, take, takeUntil} from "rxjs";
import {environment} from "../../../../environments/environment";
import {CespiteService} from "../../../services/cespite/cespite.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FiltroCespite} from "../../../models/FiltroCespite";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";
import {QuadraturaCespite} from "../../../models/QuadraturaCespite";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-ammortamento',
  templateUrl: './ammortamento.component.html',
  styleUrls: ['./ammortamento.component.css']
})
export class AmmortamentoComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  collapse: boolean = true;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  cespiteList: any = [];
  dateForm: any = FormGroup;
  sommaAmm: any = {};
  filtroCespite: FiltroCespite = new FiltroCespite();
  myControl = new FormControl('');
  tipoCespiti: any = [];
  filteredOptions: Observable<FiltroCespite[]> | undefined;
  quad:QuadraturaCespite = new QuadraturaCespite();
  ultimoGiornoAnno:boolean = false;
  cespiteView: any = {cespiteSommaDto:{}, cespiteList: []};
  dataRegistro: any = new Date();

  constructor(private tipocespiteService: TipocespiteService, private fb: FormBuilder, private authService: AuthService, private router: ActivatedRoute, private service: CespiteService, private dialog: MatDialog, private snackbar: MatSnackBar) {
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
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      if (params.param) {
        this.origin = params.param;
      }
    });
  }

  ngOnInit(): void {
    this.dateForm = this.fb.group({
      dataCalcolo: new FormControl('')
    })
    this.getTipoCespiti();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    if(this.origin !== 'o'){
      this.retrieveList();
    }
  }

  calcola() : void {
    if(this.dateForm.value.dataCalcolo.date() == 31
      && this.dateForm.value.dataCalcolo.month() == 11){
      this.ultimoGiornoAnno = true;
    }
    this.loader = true;
    this.filtroCespite.data = this.dateForm.value.dataCalcolo.format('DDMMyyyy');
    this.dataRegistro = this.dateForm.value.dataCalcolo;
    let observable;
    if(this.origin === 'o'){
      observable = this.service.calcolaPost(this.filtroCespite, this.origin);
    } else {
      observable = this.service.calcola(this.filtroCespite.data, this.origin);
    }
    observable.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next:(res) => {
          if(this.origin === 'o') {
            this.loader = false;
            this.cespiteView = res;
            this.sommaAmm = this.cespiteView.cespiteSommaDto;
            this.cespiteList = this.cespiteView.cespiteList;
          } else {
            if(!res.error) {
              this.retrieveList();
            }
          }
        }
      })
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll(this.filtroCespite, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.loader = false;
          this.cespiteView = data;
          this.sommaAmm = this.cespiteView.cespiteSommaDto;
          this.cespiteList = this.cespiteView.cespiteList;
        }
      })
  }

  getTipoCespiti(): void {
    this.tipocespiteService.getTipoCespiti(this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.tipoCespiti = data;
        }
      })
  }

  private _filter(value: any): any[] {
    let filterValue: string;
    if(value instanceof Object) {
      filterValue = value.tipoCespite.toLowerCase();
    } else {
      filterValue = value.toLowerCase();
    }
    return this.tipoCespiti.filter((option: { tipoCespite: string; }) => option.tipoCespite.toLowerCase().includes(filterValue));
  }

  getOption(option: any) {
    if(option) {
      return option.tipoCespite + " - " + option.descrizione;
    } else {
      return option.tipoCespite;
    }
  }

  reset() {
    this.filtroCespite = new FiltroCespite();
    this.myControl.setValue('');
    if(this.origin !== 'o') {
      this.retrieveList();
    }
  }

  salvaQuad(cespite: any, ammortamento: any) {
    this.quad.anno = new Date(ammortamento.dataAmm).getFullYear();
    this.quad.idCespite = cespite.id;
    ammortamento.edit = false;
    this.service.salvaQuad(this.quad, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next:(res) => {
          this.quad = new QuadraturaCespite();
          if(!res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        }
      })
  }

  aggiornaAmmortamenti(ammortamento: any, riv: boolean) {
    if(riv){
      ammortamento.editQuotaRiv = false;
    } else {
      ammortamento.editQuota = false;
    }
    let data = this.formatDate(new Date());
    if(this.filtroCespite && this.filtroCespite.data) {
      data = this.filtroCespite.data;
    }
    this.service.aggiornaAmmortamenti(ammortamento, data, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next:(res) => {
          if(!res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
            this.retrieveList();
          }
        }
      })
  }

  contabilizzaAmm() {
    this.loader = true;
    this.service.contabilizzaAmm(this.filtroCespite.data, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next:(res) => {
          this.loader = false;
          if(!res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  scaricaRegistroCespite() {
    this.loader = true;
    let data = new Date();
    if(this.dataRegistro) {
      data = this.dataRegistro;
    }
    this.cespiteView.data = data;
    this.service.scaricaRegistroCespite(this.cespiteView, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.loader = false;
          if (data) {
            let a: any = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            let blob = new Blob([data], { type: 'application/pdf' });
            let url= window.URL.createObjectURL(blob);
            a.href = url;
            let filename = 'Registro cespiti.pdf';
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
          } else {
            this.snackbar.open('Errore', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        }
      })
  }

  private static padTo2Digits(num: any): string {
    return num.toString().padStart(2, '0');
  }

  private formatDate(date: any): string {
    return AmmortamentoComponent.padTo2Digits(date.getDate()) +
      AmmortamentoComponent.padTo2Digits(date.getMonth() + 1) +
      date.getFullYear();
  }
}
