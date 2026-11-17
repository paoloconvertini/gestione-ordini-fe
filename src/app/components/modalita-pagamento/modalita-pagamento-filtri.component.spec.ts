import {TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectHarness} from '@angular/material/select/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {of} from 'rxjs';
import {ModalitaPagamentoComponent} from './modalita-pagamento.component';
import {DashboardService} from '../../services/dashboard/dashboard.service';
import {AuthService} from '../../services/auth/auth.service';
import {OrdiniClientiStateService} from '../../services/state/ordini-clienti-state.service';
import {PagamentoOrdine} from '../../models/pagamento-ordine';

// Scenari congelati dalla verifica del 17/11/2026: nessuna dipendenza dal DB nei test.
const casi: {numero: number; serie: string; stati: PagamentoOrdine['stato'][]; percentuali: number[]}[] = [
  {numero: 910101,serie: '01',stati: ['DA_FATTURARE','AL_PRONTO'],percentuali: [30,70]},
  {numero: 910102,serie: '01',stati: ['PROGRAMMATO','AL_PRONTO'],percentuali: [30,70]},
  {numero: 910103,serie: '01',stati: ['PROGRAMMATO','AL_PRONTO'],percentuali: [30,70]},
  {numero: 910104,serie: '01',stati: ['ANOMALIA','ANOMALIA','ANOMALIA','AL_PRONTO'],percentuali: [25,25,25,25]},
  {numero: 910105,serie: '11',stati: ['EMESSO','ANOMALIA','ANOMALIA','AL_PRONTO'],percentuali: [25,25,25,25]},
  {numero: 910106,serie: '11',stati: ['EMESSO','EMESSO','ANOMALIA','AL_PRONTO'],percentuali: [25,25,25,25]},
  {numero: 910107,serie: '11',stati: ['EMESSO','EMESSO','EMESSO','EMESSO'],percentuali: [25,25,25,25]},
  {numero: 910108,serie: '11',stati: ['EMESSO','EMESSO'],percentuali: [30,70]},
  {numero: 910109,serie: '01',stati: ['EMESSO','AL_PRONTO'],percentuali: [30,70]},
  {numero: 910110,serie: '01',stati: ['DA_FATTURARE','PROGRAMMATO','AL_PRONTO'],percentuali: [20,30,50]},
  {numero: 910111,serie: '11',stati: ['EMESSO','NON_DOVUTO'],percentuali: [100,0]},
  {numero: 910112,serie: '11',stati: ['EMESSO','PROGRAMMATO'],percentuali: [30,70]}
];
const DATI_DEMO: PagamentoOrdine[] = casi.flatMap(c => c.stati.map((stato,i) => ({
  progrGenerale: c.numero*10+i,anno: 2026,serie: c.serie,progressivo: c.numero,rigo: i+2,
  articolo: i===c.stati.length-1 ? '*SALDO' : '*ACCONTO',percentuale: c.percentuali[i],
  dataPrevista: null,dataScadenza: null,descrizioneScritta: 'Condizione di pagamento',
  anomalia: stato==='ANOMALIA' ? 'Verificare la data' : '',cliente: 'CLIENTE TEST',
  statoOrdine: 'COMPLETO',stato,importoPrevisto: c.percentuali[i]*10,
  importoFatturato: stato==='EMESSO' ? c.percentuali[i]*10 : 0,
  fatture: '',controllatoIl: '2026-11-17T12:00:00'
})));

describe('ModalitaPagamentoComponent: filtri Material', () => {
  it('apre solo il lavoro da fatturare oggi e mostra gli altri stati esclusivamente tramite i filtri', async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalitaPagamentoComponent],
      imports: [CommonModule,FormsModule,RouterTestingModule,NoopAnimationsModule,
        MatButtonModule,MatFormFieldModule,MatSelectModule,MatIconModule],
      providers: [
        {provide: DashboardService,useValue: {pagamenti: () => of(DATI_DEMO)}},
        {provide: AuthService,useValue: {getVenditori: () => of([
          {codVenditore: '01',fullname: 'Venditore uno'},
          {codVenditore: '11',fullname: 'Venditore undici'}])}},
        {provide: OrdiniClientiStateService,useValue: {setState: () => {}}}
      ]
    }).compileComponents();
    const fixture=TestBed.createComponent(ModalitaPagamentoComponent);
    fixture.detectChanges(); await fixture.whenStable();
    const loader=TestbedHarnessEnvironment.loader(fixture);
    const [venditore,stato]=await loader.getAllHarnesses(MatSelectHarness);
    const visibili=() => Array.from(fixture.nativeElement.querySelectorAll('.ordine-header h3') as NodeListOf<HTMLElement>)
      .map(e => Number(e.textContent!.trim().split('/').pop())).sort((a,b) => a-b);
    expect(visibili()).toEqual([910101,910110]);
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Da fatturare oggi');
    expect(fixture.nativeElement.querySelectorAll('.scadenza').length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('Al pronto');
    expect(fixture.nativeElement.textContent).not.toContain('Già emesso');
    const casi: [string,number[]][]=[
      ['Da fatturare oggi',[910101,910110]],
      ['Anomalie',[910104,910105,910106]],
      ['Programmati',[910102,910103,910110,910112]],
      ['Saldo al pronto',[910101,910102,910103,910104,910105,910106,910109,910110]],
      ['Già emessi',[910105,910106,910107,910108,910109,910111,910112]],
      ['Tutte le scadenze',[910101,910102,910103,910104,910105,910106,910107,910108,910109,910110,910111,910112]]
    ];
    for(const [label,attesi] of casi) {
      await stato.open(); await stato.clickOptions({text: label});
      expect(visibili()).withContext(label).toEqual(attesi);
      if(label==='Tutte le scadenze') expect(fixture.nativeElement.querySelectorAll('.scadenza').length).toBe(33);
    }
    await venditore.open(); await venditore.clickOptions({text: 'Venditore undici (11)'});
    expect(visibili()).toEqual([910105,910106,910107,910108,910111,910112]);
    await stato.open(); await stato.clickOptions({text: 'Da fatturare oggi'});
    expect(visibili()).toEqual([]);
    await venditore.open(); await venditore.clickOptions({text: 'Venditore uno (01)'});
    expect(visibili()).toEqual([910101,910110]);
    const primo=fixture.nativeElement.querySelector('article.ordine') as HTMLElement;
    expect(primo.textContent).toContain('30%');
    expect(primo.textContent).not.toContain('70%');
    expect(primo.textContent).not.toContain('Al pronto');
    fixture.destroy();
  });
});
