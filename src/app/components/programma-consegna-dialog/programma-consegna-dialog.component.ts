import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ListaService} from 'src/app/services/ordine-cliente/logistica/lista.service';
import {VeicoloService} from 'src/app/services/ordine-cliente/veicolo/veicolo.service';
import {OrdineCliente} from 'src/app/models/ordine-cliente';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-programma-consegna-dialog',
  templateUrl: './programma-consegna-dialog.component.html',
  styleUrls: ['./programma-consegna-dialog.component.css']
})
export class ProgrammaConsegnaDialogComponent implements OnInit {

  form!: FormGroup;
  veicoli: any[] = [];
  consegne: any[] = [];
  giornoSelezionatoData: any;
  giornoSelezionatoLabel: string | null = null;
  fasciaClasse: string = '';

  constructor(
    private fb: FormBuilder,
    private listaService: ListaService,
    private veicoloService: VeicoloService,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<ProgrammaConsegnaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ordine: OrdineCliente }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      oraConsegna: [null, Validators.required],
      veicolo: [null, Validators.required]
    });

    this.veicoloService.getVeicoli().subscribe(res => {
      this.veicoli = res;
    });
  }

  conferma(): void {

    const nuovoOrdine = this.consegne.length
      ? Math.max(...this.consegne.map(c => c.ordine)) + 1
      : 1;

    const payload = {
      ...this.data.ordine,
      dataConsegna: this.giornoSelezionatoData,
      oraConsegna: this.form.value.oraConsegna,
      veicolo: this.form.value.veicolo,
      ordine: nuovoOrdine
    };

    this.listaService.updateVeicolo(payload).subscribe({

      next: () => {

        this.snackbar.open(
          'Consegna programmata correttamente',
          'Chiudi',
          {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );

        this.dialogRef.close(true);

      }

    });

  }

  giornoSelezionato(giorno: any): void {

    this.giornoSelezionatoData = giorno.data;

    const data = new Date(giorno.data);

    const giorni = ['DOM','LUN','MAR','MER','GIO','VEN','SAB'];
    const mesi = [
      'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
      'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
    ];

    this.giornoSelezionatoLabel =
      giorni[data.getDay()] + ' ' +
      data.getDate() + ' ' +
      mesi[data.getMonth()];

    // colore fascia
    if (this.form.value.oraConsegna === 'P') {
      this.fasciaClasse = 'fascia-pomeriggio';
    } else {
      this.fasciaClasse = 'fascia-mattina';
    }

    const filtro = {
      dataConsegnaStart: giorno.data,
      dataConsegnaEnd: giorno.data,
      veicolo: this.form.value.veicolo
    };

    this.listaService.getAll(filtro).subscribe(res => {
      this.consegne = res.list || [];
    });

  }

  chiudi(): void {
    this.dialogRef.close();
  }
}
