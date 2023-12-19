import {Component, OnInit} from '@angular/core';
import {CommonListComponent} from "../../commonListComponent";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FiltroCespite} from "../../../models/FiltroCespite";
import {map, Observable, startWith, takeUntil} from "rxjs";
import {QuadraturaCespite} from "../../../models/QuadraturaCespite";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";
import {AuthService} from "../../../services/auth/auth.service";
import {ActivatedRoute} from "@angular/router";
import {CespiteService} from "../../../services/cespite/cespite.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../../environments/environment";
import { FiltroRegistroCespite } from 'src/app/models/FiltroRegistroCespite';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-ammortamenti-rivalutato',
  templateUrl: './ammortamenti-rivalutato.component.html',
  styleUrls: ['./ammortamenti-rivalutato.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AmmortamentiRivalutatoComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  cespiteList: any= [];
  dateForm: any = FormGroup;
  sommaAmm: any;
  filtroRegistroCespite: FiltroRegistroCespite = new FiltroRegistroCespite();
  myControl = new FormControl('');
  filteredOptions: Observable<FiltroRegistroCespite[]> | undefined;
  quad:QuadraturaCespite = new QuadraturaCespite();
  ultimoGiornoAnno:boolean = false;
  cespiteView: any;
  expandedElement: any;
  displayedColumns: string[] = ['cat'];


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
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.retrieveList();
  }

  calcola() : void {
    if(this.dateForm.value.dataCalcolo.date() == 31
      && this.dateForm.value.dataCalcolo.month() == 11){
      this.ultimoGiornoAnno = true;
    }
    this.loader = true;
    this.filtroRegistroCespite.data = this.dateForm.value.dataCalcolo.format('DDMMyyyy');
    this.service.calcola(this.filtroRegistroCespite.data, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next:(res) => {
          if(!res.error) {
            this.retrieveList();
          }
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  retrieveList(): void {
    this.loader = true;
    this.service.getAll(this.filtroRegistroCespite, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.cespiteList = data.cespiteList;
          this.sommaAmm = data.cespiteSommaDto;
          this.cespiteView = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  private _filter(value: any): any[] {
    let filterValue: string;
    if(value instanceof Object) {
      filterValue = value.cespite.toLowerCase();
    } else {
      filterValue = value.toLowerCase();
    }
    return this.cespiteList.filter((option: { tipoCespite: string; }) => option.tipoCespite.toLowerCase().includes(filterValue));
  }

  getOption(option: any) {
    if(option) {
      return option.tipoCespite + " - " + option.descrizione;
    } else {
      return option.tipoCespite;
    }
  }

  reset() {
    this.filtroRegistroCespite = new FiltroRegistroCespite();
    this.myControl.setValue('');
    this.retrieveList();
  }

  salvaQuad(cespite: any, ammortamento: any) {
    this.quad.anno = new Date(ammortamento.dataAmm).getFullYear();
    this.quad.idCespite = cespite.id;
    ammortamento.edit = false;
    this.service.salvaQuad(this.quad, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next:(res) => {
          if(!res.error) {
            this.snackbar.open(res.msg, 'Chiudi', {
              horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: (e: any) => {
          console.error(e);
        }
      })
  }

  contabilizzaAmm() {
    this.loader = true;
    this.service.contabilizzaAmm(this.origin).pipe(takeUntil(this.ngUnsubscribe))
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
            a.download = data.filename;
            a.click();
            window.URL.revokeObjectURL(url);
          } else {
            this.snackbar.open('Errore', 'Chiudi', {
              duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
            });
          }
        },
        error: (e:any) => {
          console.log(e);
          this.loader = false;
        }
      })
  }

  espandiAndsearch() {

  }

  getAmmortamenti(cat: any) {

  }
}
