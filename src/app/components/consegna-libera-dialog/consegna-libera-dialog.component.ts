import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, debounceTime, distinctUntilChanged, of, switchMap, takeUntil} from 'rxjs';
import {BaseComponent} from '../baseComponent';
import {ListaService} from '../../services/ordine-cliente/logistica/lista.service';
import {VeicoloService} from '../../services/ordine-cliente/veicolo/veicolo.service';
import {PianocontiService} from '../../services/pianoconti/pianoconti.service';
import {ShowroomService} from '../../services/showroom/showroom.service';

@Component({
  selector: 'app-consegna-libera-dialog',
  templateUrl: './consegna-libera-dialog.component.html',
  styles: ['form { display: flex; flex-direction: column; gap: 8px; }']
})
export class ConsegnaLiberaDialogComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  veicoli: any[] = [];
  clienti: any[] = [];
  comuni: any[] = [];
  saving = false;
  latitudine: number | null = null;
  longitudine: number | null = null;

  constructor(private fb: FormBuilder, private lista: ListaService,
              private veicoloService: VeicoloService, private pianoconti: PianocontiService,
              private snackbar: MatSnackBar, private showroom: ShowroomService,
              private dialogRef: MatDialogRef<ConsegnaLiberaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {consegna?: any; dataConsegna?: string}) {
    super();
  }

  ngOnInit(): void {
    const c = this.data?.consegna || {};
    this.latitudine = c.latitudine ?? null;
    this.longitudine = c.longitudine ?? null;
    this.form = this.fb.group({
      intestazione: [c.intestazione || '', [Validators.required, Validators.maxLength(255)]],
      indirizzo: [c.indirizzo || '', [Validators.required, Validators.maxLength(255)]],
      localita: [c.localita || '', [Validators.required, Validators.maxLength(255)]],
      telefono: [c.telefono || '', Validators.maxLength(50)],
      dataConsegna: [c.dataConsegna || this.data?.dataConsegna || null, Validators.required],
      oraConsegna: [c.oraConsegna || null, Validators.required],
      veicolo: [c.veicolo ?? null, Validators.required]
    });
    this.veicoloService.getVeicoli().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: res => this.veicoli = res,
      error: () => this.errore('Impossibile caricare i veicoli')
    });
    this.form.get('intestazione')!.valueChanges.pipe(
      debounceTime(250), distinctUntilChanged(),
      switchMap(value => typeof value === 'string' && value.trim().length >= 3
        ? this.pianoconti.searchClienti(value.trim()).pipe(catchError(() => of([]))) : of([])),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(res => this.clienti = res);
    this.form.get('localita')!.valueChanges.pipe(
      debounceTime(250), distinctUntilChanged(),
      switchMap(value => typeof value === 'string' && value.trim().length >= 3
        ? this.showroom.searchComuni(null, value.trim()).pipe(catchError(() => of([]))) : of([])),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(res => this.comuni = res);
    for (const campo of ['indirizzo', 'localita']) {
      this.form.get(campo)!.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.latitudine = null;
        this.longitudine = null;
      });
    }
  }

  selectCliente(cliente: any): void {
    this.form.patchValue({intestazione: cliente.intestazione, indirizzo: cliente.indirizzo || '',
      localita: cliente.localita || '', telefono: cliente.cellulare || cliente.telefono || ''});
    this.latitudine = cliente.latitudine ?? null;
    this.longitudine = cliente.longitudine ?? null;
    this.clienti = [];
  }

  conferma(): void {
    if (this.form.invalid || this.saving) return;
    const value = this.form.value;
    if (![value.intestazione, value.indirizzo, value.localita].every((v: string) => v?.trim())) {
      this.errore('Compilare intestazione, indirizzo e località');
      return;
    }
    this.saving = true;
    const rawDate = value.dataConsegna;
    // Il datepicker può restituire Date o Moment. Conservare il giorno locale.
    const dataConsegna = typeof rawDate === 'string' ? rawDate.substring(0, 10)
      : typeof rawDate.format === 'function' ? rawDate.format('YYYY-MM-DD')
      : `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`;
    this.lista.salvaConsegnaLibera({...value, dataConsegna,
      latitudine: this.latitudine, longitudine: this.longitudine}, this.data?.consegna?.idConsegnaLibera)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          this.saving = false;
          this.errore('Impossibile salvare la consegna');
        }
      });
  }

  chiudi(): void { this.dialogRef.close(); }

  private errore(testo: string): void {
    this.snackbar.open(testo, 'Chiudi', {duration: 4000});
  }
}
