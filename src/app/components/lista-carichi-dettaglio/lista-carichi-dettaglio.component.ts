import {Component, OnInit, ViewChild} from '@angular/core';
import {BaseComponent} from "../baseComponent";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ListaCarichi} from "../../models/listaCarichi";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {takeUntil} from "rxjs";
import {ListaCarichiService} from "../../services/lista-carichi/lista-carichi.service";
import {Deposito} from "../../models/deposito";
import {Trasportatore} from "../../models/trasportatore";
import {MatExpansionPanel} from "@angular/material/expansion";

@Component({
  selector: 'app-lista-carichi-dettaglio',
  templateUrl: './lista-carichi-dettaglio.component.html',
  styleUrls: ['./lista-carichi-dettaglio.component.css']
})
export class ListaCarichiDettaglioComponent extends BaseComponent implements OnInit {

  @ViewChild('first') first: any;
  loader = false;
  id: any = null;
  carico: ListaCarichi = new ListaCarichi();
  caricoForm: any = FormGroup;
  depositi: Deposito[] = [];
  trasportatori: Trasportatore[] = [];
  aziende: any = [];
  conto: any;
  filtro: any = {azienda: '', deposito:'', trasportatore: ''}
  loadingAz = false;
  loadingDe = false;
  loadingTr = false;
  errorDeposito: boolean = false;
  errorTrasportatore: boolean = false;
  deposito: Deposito = new Deposito();


  constructor(private fb: FormBuilder, private service: ListaCarichiService,
              private router: ActivatedRoute, private route: Router, private snackbar: MatSnackBar) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      if (params && params.id) {
        this.id = params.id;
        this.getCarico();
      }
    });
  }

  ngOnInit(): void {
    this.caricoForm = this.fb.group({
      azienda: new FormControl('', Validators.required),
      numeroOrdine: new FormControl('', Validators.required),
      deposito: new FormControl(''),
      dataDisponibile: new FormControl(''),
      peso: new FormControl(''),
      trasportatore: new FormControl(''),
      convalida: new FormControl('')
    });
  }

  cercaAzienda() {
    if (this.caricoForm.value.azienda.length < 3) {
      return;
    }
    this.loadingAz = true
    this.service.searchAzienda(this.caricoForm.value.azienda).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        this.loadingAz = false;
        if (res && !res.error) {
          this.aziende = res;
        }
      }
    });
  }

  cercaDeposito() {
    if (this.caricoForm.value.deposito.length < 3) {
      return;
    }
    this.loadingDe = true;
    this.service.searchDeposito(this.caricoForm.value.deposito).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        this.loadingDe = false;
        if (res && !res.error) {
          this.depositi = res;
        }
      }
    });
  }

  displayFnTr(trasportatore: Trasportatore) {
    if (trasportatore) {
      return trasportatore.nome;
    } else {
      return '';
    }
  }

  displayFnDe(deposito: Deposito) {
    if (deposito) {
      return deposito.nome;
    } else {
      return '';
    }
  }

  cercaTrasportatore() {
    if (this.caricoForm.value.trasportatore.length < 3) {
      return;
    }
    this.loadingTr = true;
    this.service.searchTrasportatore(this.caricoForm.value.trasportatore).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        this.loadingTr = false;
        if (res && !res.error) {
          this.trasportatori = res;
        }
      }
    });
  }


  getCarico() {
    this.loader = true;
    this.service.getCarico(this.id).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: ListaCarichi) => {
          this.carico = data;
          this.caricoForm.value.deposito = this.carico.deposito;
          this.caricoForm.value.trasportatore = this.carico.trasportatore;
          this.loader = false;
        }
      })
  }

  submitForm() {
    this.loader = true;
    if(!this.carico.idDeposito){
      this.errorDeposito = true;
      return
    }
    if(!this.carico.idTrasportatore){
      this.errorTrasportatore = true;
      return
    }
    if (this.caricoForm.valid) {
      this.service.create(this.carico).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res) {
              if(!res.error) {
                this.route.navigateByUrl('lista-carichi');
              } else {
                this.snackbar.open(res.msg, 'Chiudi',{
                  duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
                });
              }
            }
            this.loader = false;
          }
        });
    }
  }

  indietro() {
    this.route.navigateByUrl('lista-carichi');
  }

  settaTrasportatore(trasportatore: Trasportatore) {
    this.carico.idTrasportatore = trasportatore.id;
    this.errorTrasportatore = false;
  }

  settaDeposito(deposito: Deposito) {
    this.carico.idDeposito = deposito.id;
    this.errorDeposito = false;
  }

  salvaDeposito(deposito: Deposito) {
    this.service.save(deposito).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (res) => {
        if (!res.error) {
          this.snackbar.open(res.msg, 'Chiudi',{
            duration: 5000, horizontalPosition: 'center', verticalPosition: 'top'
          });
          this.cercaDeposito();
          if(this.first.expanded){
            this.first.close();
          } else {
            this.first.open();
          }
        }
      }
    })
  }
}
