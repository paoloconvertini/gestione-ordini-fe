import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListaService } from 'src/app/services/ordine-cliente/logistica/lista.service';
import { VeicoloService } from 'src/app/services/ordine-cliente/veicolo/veicolo.service';
import { OrdineCliente } from 'src/app/models/ordine-cliente';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-programma-consegna-dialog',
  templateUrl: './programma-consegna-dialog.component.html',
  styleUrls: ['./programma-consegna-dialog.component.css']
})
export class ProgrammaConsegnaDialogComponent implements OnInit {

  form!: FormGroup;
  veicoli: any[] = [];
  consegne: any[] = [];

  constructor(
    private fb: FormBuilder,
    private listaService: ListaService,
    private veicoloService: VeicoloService,
    private dialogRef: MatDialogRef<ProgrammaConsegnaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ordine: OrdineCliente }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      dataConsegna: [null, Validators.required],
      oraConsegna: [null, Validators.required],
      veicolo: [null, Validators.required]
    });

    this.veicoloService.getVeicoli().subscribe(res => {
      this.veicoli = res;
    });
  }

  caricaConsegne(): void {
    const filtro = {
      dataConsegnaStart: this.form.value.dataConsegna,
      dataConsegnaEnd: this.form.value.dataConsegna,
      veicolo: this.form.value.veicolo
    };

    this.listaService.getAll(filtro).subscribe(res => {
      this.consegne = res.list || [];
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.consegne, event.previousIndex, event.currentIndex);
  }

  conferma(): void {
    const nuovoOrdine = this.consegne.length
      ? Math.max(...this.consegne.map(c => c.ordine)) + 1
      : 1;

    const payload = {
      ...this.data.ordine,
      dataConsegna: this.form.value.dataConsegna,
      oraConsegna: this.form.value.oraConsegna,
      veicolo: this.form.value.veicolo,
      ordine: nuovoOrdine
    };

    this.listaService.updateVeicolo(payload).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  chiudi(): void {
    this.dialogRef.close();
  }
}
