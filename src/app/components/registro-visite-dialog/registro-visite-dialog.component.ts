import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import {BaseComponent} from "../baseComponent";
import {ShowroomService} from "../../services/showroom/showroom.service";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-registro-visite-dialog',
  templateUrl: './registro-visite-dialog.component.html',
  styleUrls: ['./registro-visite-dialog.component.css']
})
export class RegistroVisiteDialogComponent extends BaseComponent implements OnInit {

  dto: any = {};

  motiviRoot: any[] = [];
  motiviFigli: any[] = [];

  motivoRootId: number | null = null;
  motivoFiglioId: number | null = null;
  venditori: any[] = [];

  listaComuni: any[] = [];
  comuneSearch: string | null = null;

  isEdit = false;
  loader = false;

  constructor(
    private service: ShowroomService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<RegistroVisiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super();
  }

  ngOnInit(): void {

    this.isEdit = !!this.data;

    if (this.isEdit) {
      this.dto = { ...this.data };
      this.comuneSearch = this.data.comuneNome;
    }

    this.loadMotiviRoot();

    if (this.isEdit && this.dto.motivoId) {
      this.loadMotivoForEdit(this.dto.motivoId);
    }
    this.loadVenditori();
  }

  loadMotivoForEdit(motivoId: number) {

    this.service.getMotivoById(motivoId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(motivo => {

        if (motivo.parentId) {
          // è un figlio
          this.motivoRootId = motivo.parentId;
          this.motivoFiglioId = motivo.id;

          this.service.getMotiviFigli(motivo.parentId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(figli => {
              this.motiviFigli = figli;
            });

        } else {
          // è un root salvato
          this.motivoRootId = motivo.id;
        }
      });
  }

  onMotivoRootChange(rootId: number) {

    this.motivoRootId = rootId;
    this.motivoFiglioId = null;
    this.motiviFigli = [];

    if (!rootId) return;

    this.service.getMotiviFigli(rootId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.motiviFigli = res;
      });
  }

  loadMotiviRoot() {
    this.service.getMotiviRoot()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.motiviRoot = res);
  }

  loadVenditori() {
    this.authService.getVenditori(['Venditore'])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.venditori = res);
  }

  onComuneSearch(value: string) {

    if (!value || value.length < 3) {
      this.listaComuni = [];
      return;
    }

    this.service.searchComuni(null, value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this.listaComuni = res);
  }

  selectComune(c: any) {
    this.dto.comuneIstat = c.codiceIstat;
    this.comuneSearch = c.nomeComune;
    this.listaComuni = [];
  }

  save() {

    const motivoDaSalvare =
      this.motivoFiglioId ?? this.motivoRootId;

    if (!this.dto.nomeCliente || !motivoDaSalvare || !this.dto.venditoreCodice) {
      return;
    }

    this.dto.motivoId = motivoDaSalvare;

    this.loader = true;

    const call = this.isEdit
      ? this.service.update(this.dto.id, this.dto)
      : this.service.create(this.dto);

    call.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loader = false;
          this.dialogRef.close(true);
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}
