import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttivitaMontaggioService } from '../../services/attivita-montaggio/attivita-montaggio.service';
import {ShowroomService} from "../../services/showroom/showroom.service";
import {TipiAttivitaMontaggioService} from "../../services/tipi-attivita-montaggio/tipi-attivita-montaggio.service";
import {OperaiService} from "../../services/operai/operai.service";
import {takeUntil} from "rxjs";
import {BaseComponent} from "../baseComponent";
import {CommonListComponent} from "../commonListComponent";
import {PianocontiService} from "../../services/pianoconti/pianoconti.service";

@Component({
  selector: 'app-attivita-montaggio-dialog',
  templateUrl: './attivita-montaggio-dialog.component.html',
  styleUrls: ['./attivita-montaggio-dialog.component.css']
})
export class AttivitaMontaggioDialogComponent extends BaseComponent implements OnInit {

  loader = false;

  model: any = {
    tipoAppuntamento: 'MONTAGGIO',
    dettagli: [],
    operai: []
  };

  province: string[] = [];
  listaComuni: any[] = [];
  comuneSearch: string | null = null;
  tipiAttivita: any[] = [];
  operai: any[] = [];
  listaClienti: any[] = [];
  clienteSearch: string | null = null;

  stati = [
    {
      value: 'PROGRAMMATO',
      label: 'Programmato'
    },
    {
      value: 'IN_CORSO',
      label: 'In corso'
    },
    {
      value: 'COMPLETATO',
      label: 'Completato'
    },
    {
      value: 'ANNULLATO',
      label: 'Annullato'
    }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AttivitaMontaggioDialogComponent>,
    private service: AttivitaMontaggioService,
    private showroomService: ShowroomService,
    private tipiService: TipiAttivitaMontaggioService,
    private operaiService: OperaiService,
    private pianoContiService: PianocontiService
  ) {
    super();
  }

  ngOnInit(): void {

    this.loadProvince();

    this.loadOperai();

    this.loadTipiAttivita();

    if (this.data?.id) {
      this.load();
      return;
    }

    if (this.data?.dataOraDa) {

      const d = new Date(this.data.dataOraDa);

      this.model.dataDa = d;
      this.model.dataA = d;

      this.model.oraDa =
        d.toTimeString().substring(0, 5);

      const end = new Date(d);

      end.setHours(end.getHours() + 1);

      this.model.oraA =
        end.toTimeString().substring(0, 5);
    }
  }

  load(): void {

    this.loader = true;

    this.service.getById(this.data.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {

          this.model = res;

          if (this.model.dataOraDa) {

            const dataDa = new Date(this.model.dataOraDa);

            this.model.dataDa = dataDa;

            this.model.oraDa =
              dataDa.toTimeString().substring(0, 5);
          }

          if (this.model.dataOraA) {

            const dataA = new Date(this.model.dataOraA);

            this.model.dataA = dataA;

            this.model.oraA =
              dataA.toTimeString().substring(0, 5);
          }

          this.comuneSearch = this.model.comune;
          this.clienteSearch = this.model.nomeCliente;
          this.loader = false;
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  onClienteSearch(value: string): void {
    this.clienteSearch = value;
    this.model.nomeCliente = value;
    this.model.gruppoConto = null;
    this.model.sottoConto = null;
    if (!value || value.length < 3) {
      this.listaClienti = [];
      return;
    }
    this.pianoContiService.searchClienti(value).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (res: any) => {
          this.listaClienti = res;
        },
        error: (e: any) => {
          console.error(e);
        }
      });
  }

  selectCliente(cliente: any): void {
    this.model.gruppoConto = cliente.gruppoConto;
    this.model.sottoConto = cliente.sottoConto;
    this.model.nomeCliente = cliente.intestazione;
    this.model.via = cliente.indirizzo;
    this.model.cap = cliente.cap;
    this.model.comune = cliente.localita;
    this.comuneSearch = cliente.localita;
    this.model.provincia = cliente.provincia;
    this.model.telefono = cliente.cellulare || cliente.telefono;
    this.model.email = cliente.email;
    this.clienteSearch = cliente.intestazione;
    this.listaClienti = [];
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.model.dataOraDa = this.buildDateTime(
      this.model.dataDa,
      this.model.oraDa
    );

    this.model.dataOraA = this.buildDateTime(
      this.model.dataA,
      this.model.oraA
    );

    this.loader = true;

    const request = this.model.id
      ? this.service.update(this.model.id, this.model)
      : this.service.create(this.model);

    request
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loader = false;
          this.dialogRef.close(true);
        },
        error: (e: any) => {
          console.error(e);
          this.loader = false;
        }
      });
  }

  loadOperai(): void {

    this.operaiService.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.operai = res;
        },
        error: (e: any) => {
          console.error(e);
        }
      });
  }

  loadTipiAttivita(): void {

    this.tipiService.getAll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.tipiAttivita = res;
        },
        error: (e: any) => {
          console.error(e);
        }
      });
  }

  delete(): void {

    if (!confirm('Confermi eliminazione?')) {
      return;
    }

    this.loader = true;

    this.service.delete(this.model.id)
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

  loadProvince(): void {

    this.showroomService.getProvince()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res: any) => {
          this.province = res;
        },
        error: (e: any) => {
          console.error(e);
        }
      });
  }

  onComuneSearch(value: string): void {

    if (!value || value.length < 3) {
      this.listaComuni = [];
      return;
    }

    this.showroomService.searchComuni(
      this.model.provincia || null,
      value
    ).subscribe(res => {
      this.listaComuni = res;
    });
  }

  selectComune(c: any): void {

    this.model.comune = c.nomeComune;
    this.model.provincia = c.siglaProvincia;

    this.comuneSearch = c.nomeComune;

    this.listaComuni = [];
  }

  buildDateTime(data: any, ora: string): string {

    if (!data || !ora) {
      return '';
    }

    const d = new Date(data);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${ora}:00`;
  }

  addOperaio(): void {

    this.model.operai.push({
      idOperaio: null,
      principale: false
    });
  }

  removeOperaio(index: number): void {

    this.model.operai.splice(index, 1);
  }

  addDettaglio(): void {

    this.model.dettagli.push({
      idTipoAttivita: null,
      quantita: 1,
      completato: false,
      note: null
    });
  }

  removeDettaglio(index: number): void {

    this.model.dettagli.splice(index, 1);
  }

}
