import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import {BaseComponent} from "../baseComponent";
import {ShowroomService} from "../../services/showroom/showroom.service";
import {AuthService} from "../../services/auth/auth.service";
import {PermissionService} from "../../services/auth/permission.service";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  sedi: any[] = [];
  oraVisita: string | null = null;

  constructor(
    private service: ShowroomService,
    private authService: AuthService,
    public perm: PermissionService,
    private showroomService: ShowroomService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<RegistroVisiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super();
  }

  ngOnInit(): void {

    this.isEdit = this.data && this.data.id != null;

    if (this.perm.canFilterSede) {
      this.showroomService.getSedi().subscribe(res => {
        this.sedi = res;
      });
    }

    // 🔥 BASE DTO
    this.dto = {
      dataVisita: new Date()
    };

    // 🔥 MODIFICA
    if (this.isEdit) {
      this.dto = { ...this.data };
      this.comuneSearch = this.data.comuneNome;

      if (this.dto.dataVisita) {
        this.dto.dataVisita = new Date(this.dto.dataVisita);
      }
    }

    // 🔥 NUOVO DA CALENDARIO
    if (!this.isEdit && this.data?.dataVisita) {
      this.dto.dataVisita = new Date(this.data.dataVisita);
    }

    if (this.dto.dataVisita) {
      const d = new Date(this.dto.dataVisita);

      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');

      this.oraVisita = `${hh}:${mm}`;
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
    if (this.perm.canFilterSede && !this.dto.sedeId) {
      this.snackbar.open('Selezionare la sede', 'Chiudi', { duration: 2000 });
      return;
    }
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
    if (this.dto.dataVisita && this.oraVisita) {

      const [hh, mm] = this.oraVisita.split(':');

      const d = new Date(this.dto.dataVisita);

      d.setHours(Number(hh));
      d.setMinutes(Number(mm));
      d.setSeconds(0);

      this.dto.dataVisita = new Date(
        d.getTime() - d.getTimezoneOffset() * 60000
      );
    }
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

  onTelefonoInput(event: Event) {
    const input = event.target as HTMLInputElement;

    const clean = input.value.replace(/[^0-9]/g, '');

    if (input.value !== clean) {
      input.value = clean;
    }

    this.dto.telefono = clean;
  }

  close() {
    this.dialogRef.close();
  }
}
