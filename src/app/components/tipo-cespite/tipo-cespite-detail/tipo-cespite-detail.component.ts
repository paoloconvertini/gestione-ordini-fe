import {Component, OnInit} from '@angular/core';
import {BaseComponent} from "../../baseComponent";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs";
import {TipocespiteService} from "../../../services/tipocespite/tipocespite.service";

@Component({
  selector: 'app-tipo-cespite-detail',
  templateUrl: './tipo-cespite-detail.component.html',
  styleUrls: ['./tipo-cespite-detail.component.css']
})
export class TipoCespiteDetailComponent extends BaseComponent implements OnInit {

  loader = false;
  origin: string = '';
  id: any = null;
  categoriaCespite: any = {};
  tipoCespiteForm: any = FormGroup;

  constructor(private fb: FormBuilder, private service: TipocespiteService,
              private router: ActivatedRoute, private route: Router) {
    super();
    this.router.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      if (params.id) {
        this.id = params.id;
        this.getTipoCespite();
      }
      if (params.param) {
        this.origin = params.param;
      }
    });
  }

  ngOnInit(): void {
    this.tipoCespiteForm = this.fb.group({
      tipoCespite: new FormControl(this.categoriaCespite && this.categoriaCespite.tipoCespite?this.categoriaCespite.tipoCespite:'', Validators.required),
      descrizione: new FormControl('', Validators.required),
      codice: new FormControl('', Validators.required),
      percAmmortamento: new FormControl('', Validators.required),
      ammGruppo: new FormControl('', Validators.required),
      ammConto: new FormControl('', Validators.required),
      costoGruppo: new FormControl('', Validators.required),
      costoConto: new FormControl('', Validators.required),
      fondoGruppo: new FormControl('', Validators.required),
      fondoConto: new FormControl('', Validators.required),
      plusGruppo: new FormControl(this.categoriaCespite.plusGruppo? this.categoriaCespite.plusGruppo: 4311, Validators.required),
      plusConto: new FormControl(this.categoriaCespite.plusConto?this.categoriaCespite.plusConto:'000005', Validators.required),
      minusGruppo: new FormControl(this.categoriaCespite.minusGruppo?this.categoriaCespite.minusGruppo:3311, Validators.required),
      minusConto: new FormControl(this.categoriaCespite.minusConto?this.categoriaCespite.minusConto:'000001', Validators.required)
    });
  }

  submitForm() {
    this.loader = true;
    if (this.tipoCespiteForm.valid) {
      this.service.save(this.tipoCespiteForm.value).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res && !res.error) {
              this.route.navigate(['/' + this.origin + '/tipo-cespiti']);
            }
            this.loader = false;
          }, error: () => this.loader = false
        });
    }
  }

  indietro() {
    this.route.navigate(['/' + this.origin + '/tipo-cespiti']);
  }

  getTipoCespite() {
    this.loader = true;
    this.service.getById(this.id).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data: any) => {
          this.categoriaCespite = data;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      })
  }
}
