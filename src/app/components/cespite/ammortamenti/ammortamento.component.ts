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

@Component({
  selector: 'app-ammortamento',
  templateUrl: './ammortamento.component.html',
  styleUrls: ['./ammortamento.component.css']
})
export class AmmortamentoComponent extends CommonListComponent implements OnInit {

  isAdmin: boolean = false;
  isMagazziniere: boolean = false;
  isAmministrativo: boolean = false;
  isVenditore: boolean = false;
  isLogistica: boolean = false;
  cespiteList: any;
  dateForm: any = FormGroup;
  sommaAmm: any;
  filtroCespite: FiltroCespite = new FiltroCespite();
  myControl = new FormControl('');
  tipoCespiti: any = [];
  filteredOptions: Observable<FiltroCespite[]> | undefined;
  quad:QuadraturaCespite = new QuadraturaCespite();
  ultimoGiornoAnno:boolean = false;

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
    this.retrieveList();
  }

  calcola() : void {
    if(this.dateForm.value.dataCalcolo.date() == 31
      && this.dateForm.value.dataCalcolo.month() == 11){
      this.ultimoGiornoAnno = true;
    }
    this.loader = true;
    let param = this.dateForm.value.dataCalcolo.format('DDMMyyyy');
    this.service.calcola(param, this.origin).pipe(takeUntil(this.ngUnsubscribe))
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
    this.service.getAll(this.filtroCespite, this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any | undefined) => {
          this.cespiteList = data.cespiteList;
          this.sommaAmm = data.cespiteSommaDto;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }

  getTipoCespiti(): void {
    this.tipocespiteService.getTipoCespiti(this.origin).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.tipoCespiti = data;
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

}
