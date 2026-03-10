import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ListaService} from "../../services/ordine-cliente/logistica/lista.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {VeicoloService} from "../../services/ordine-cliente/veicolo/veicolo.service";

export interface ConsegnaEditData {
  consegna: any;
}

@Component({
  selector: 'app-consegna-edit-dialog',
  templateUrl: './consegna-edit-dialog.component.html'
})
export class ConsegnaEditDialogComponent {

  form!: FormGroup;

  veicoli: any[] = [];

  giornoSelezionatoData!: string;
  giornoSelezionatoLabel!: string;

  constructor(
    private fb: FormBuilder,
    private listaService: ListaService,
    private veicoloService: VeicoloService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConsegnaEditDialogComponent>
  ) {}

  ngOnInit(): void {

    const c = this.data.consegna;

    this.form = this.fb.group({
      oraConsegna: [c.oraConsegna, Validators.required],
      veicolo: [c.veicolo, Validators.required],
      dataConsegna: [new Date(c.dataConsegna), Validators.required]
    });

    this.giornoSelezionatoData = c.dataConsegna;
    this.giornoSelezionatoLabel = c.dataConsegna;

    this.loadVeicoli();

  }

  loadVeicoli(): void {
    this.veicoloService.getVeicoli().subscribe(res => {
      this.veicoli = res;
    });
  }

  giornoSelezionato(g: any): void {

    this.giornoSelezionatoData = g.data;
    this.giornoSelezionatoLabel = g.data;

  }

  conferma(): void {
    const data: Date = this.form.value.dataConsegna;
    const dto = {

      anno: this.data.consegna.anno,
      serie: this.data.consegna.serie,
      progressivo: this.data.consegna.progressivo,

      veicolo: this.form.value.veicolo,
      oraConsegna: this.form.value.oraConsegna,

      dataConsegna: data.toISOString().substring(0,10),

      ordine: this.data.consegna.ordine

    };

    this.listaService.updateVeicolo(dto)
      .subscribe(() => {

        this.dialogRef.close(true);

      });

  }

  chiudi(): void {
    this.dialogRef.close();
  }
}
