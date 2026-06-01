import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { ShowroomService } from '../../services/showroom/showroom.service';
import { AuthService } from '../../services/auth/auth.service';
import { PianocontiService } from '../../services/pianoconti/pianoconti.service';
import {AppuntamentoService} from "../../services/appuntamento/appuntamento.service";

@Component({
  selector: 'app-appuntamento-dialog',
  templateUrl: './appuntamento-dialog.component.html',
  styleUrls: ['./appuntamento-dialog.component.css']
})
export class AppuntamentoDialogComponent extends BaseComponent implements OnInit {

  selectedTabIndex = 0;

  loader = false;

  dto: any = {};

  sedi: any[] = [];

  venditori: any[] = [];

  motiviRoot: any[] = [];

  motiviFigli: any[] = [];

  motivoRootId: number | null = null;

  motivoFiglioId: number | null = null;

  listaClienti: any[] = [];

  clienteSearch: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AppuntamentoDialogComponent>,
    private service: AppuntamentoService,
    private showroomService: ShowroomService,
    private authService: AuthService,
    private pianoContiService: PianocontiService
  ) {
    super();
  }

  ngOnInit(): void {

    this.loadSedi();

    this.loadVenditori();

    this.loadMotiviRoot();

    this.dto = {};

    if (this.data?.id) {
      this.load();
      return;
    }

    if (this.data?.dataAppuntamento) {

      const d = new Date(this.data.dataAppuntamento);

      this.dto.dataAppuntamento = d;

      this.dto.oraDa =
        d.toTimeString().substring(0, 5);

      const end = new Date(d);

      end.setHours(end.getHours() + 1);

      this.dto.oraA =
        end.toTimeString().substring(0, 5);
    }
  }

  load(): void {

    this.loader = true;

    this.service.getById(this.data.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {

          this.dto = res;

          this.clienteSearch =
            this.dto.nomeCliente;

          if (this.dto.dataAppuntamento) {
            this.dto.dataAppuntamento =
              new Date(this.dto.dataAppuntamento);
          }

          if (this.dto.motivoId) {
            this.loadMotivoForEdit(this.dto.motivoId);
          }

          this.loader = false;
        },
        error: () => {
          this.loader = false;
        }
      });
  }

  loadSedi(): void {

    this.showroomService.getSedi()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.sedi = res;
      });
  }

  loadVenditori(): void {

    this.authService.getVenditori(['Venditore'])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.venditori = res;
      });
  }

  loadMotiviRoot(): void {

    this.showroomService.getMotiviRoot()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.motiviRoot = res;
      });
  }

  loadMotivoForEdit(motivoId: number): void {

    this.showroomService.getMotivoById(motivoId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((motivo: any) => {

        if (motivo.parentId) {

          this.motivoRootId = motivo.parentId;

          this.motivoFiglioId = motivo.id;

          this.showroomService.getMotiviFigli(motivo.parentId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(figli => {
              this.motiviFigli = figli;
            });

        } else {

          this.motivoRootId = motivo.id;
        }
      });
  }

  onMotivoRootChange(rootId: number): void {

    this.motivoRootId = rootId;

    this.motivoFiglioId = null;

    this.motiviFigli = [];

    if (!rootId) {
      return;
    }

    this.showroomService.getMotiviFigli(rootId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.motiviFigli = res;
      });
  }

  onClienteSearch(value: string): void {

    this.clienteSearch = value;

    this.dto.nomeCliente = value;

    this.dto.gruppoConto = null;
    this.dto.sottoConto = null;

    if (!value || value.length < 3) {
      this.listaClienti = [];
      return;
    }

    this.pianoContiService.searchClienti(value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.listaClienti = res;
        }
      });
  }

  selectCliente(cliente: any): void {

    this.dto.gruppoConto = cliente.gruppoConto;
    this.dto.sottoConto = cliente.sottoConto;

    this.dto.nomeCliente = cliente.intestazione;

    this.dto.via = cliente.indirizzo;
    this.dto.cap = cliente.cap;
    this.dto.comune = cliente.localita;
    this.dto.provincia = cliente.provincia;

    this.dto.telefono =
      cliente.cellulare || cliente.telefono;

    this.dto.email = cliente.email;

    this.clienteSearch =
      cliente.intestazione;

    this.listaClienti = [];
  }

  save(): void {

    this.dto.motivoId =
      this.motivoFiglioId ?? this.motivoRootId;

    this.loader = true;

    const request = this.dto.id
      ? this.service.update(this.dto.id, this.dto)
      : this.service.create(this.dto);

    request
      .pipe(takeUntil(this.ngUnsubscribe))
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

  delete(): void {

    if (!confirm('Confermi eliminazione?')) {
      return;
    }

    this.loader = true;

    this.service.delete(this.dto.id)
      .pipe(takeUntil(this.ngUnsubscribe))
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

  close(): void {
    this.dialogRef.close();
  }
}
