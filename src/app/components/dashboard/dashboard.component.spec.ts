import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { AuthService } from '../../services/auth/auth.service';
import { PermissionService } from '../../services/auth/permission.service';
import { OrdiniClientiStateService } from '../../services/state/ordini-clienti-state.service';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { FiltroOrdini } from '../../models/FiltroOrdini';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let state: any;
  let router: any;
  let service: any;
  beforeEach(() => {
    state = jasmine.createSpyObj('state', ['setState', 'resetState']);
    router = jasmine.createSpyObj('router', ['navigate']);
    service = jasmine.createSpyObj('service', ['get']);
    service.get.and.returnValue(of({ ordiniAttivi: 12, daCodificare: 3, prontoConsegna: 4 }));
    component = new DashboardComponent(service, {getCurrentUser: () => ({username: 'Test'})} as any,
      {} as any, state, router);
  });
  afterEach(() => component.ngOnDestroy());

  it('apre un filtro completo senza ereditare ricerche precedenti', () => {
    component.openOrders('codifica');
    const filtro = state.setState.calls.mostRecent().args[0] as FiltroOrdini;
    expect(state.resetState).toHaveBeenCalled();
    expect(filtro.daCodificare).toBeTrue();
    expect(filtro.prontoConsegna).toBeFalse();
    expect(filtro.filtroStatus).toBe('TUTTI');
    expect(filtro.page).toBe(0);
    expect(filtro.codVenditore).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/ordini-clienti']);
  });
  it('apre gli ordini rosa e rimuove il filtro tornando a tutti', () => {
    component.openOrders('modificati');
    const filtro = state.setState.calls.mostRecent().args[0] as FiltroOrdini;
    expect(filtro.daOrdinareModificati).toBeTrue();
    expect(filtro.filtroStatus).toBe('DA_ORDINARE');
    expect(filtro.daCodificare).toBeFalse();
    expect(state.resetState).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/ordini-clienti']);
    component.openOrders('all');
    expect(state.setState.calls.mostRecent().args[0].daOrdinareModificati).toBeFalse();
  });
  it('apre gli ordini nello stato DA_ORDINARE senza filtro codifica', () => {
    component.openOrders('ordinare');
    const filtro = state.setState.calls.mostRecent().args[0];
    expect(filtro.filtroStatus).toBe('DA_ORDINARE');
    expect(filtro.daCodificare).toBeFalse();
    expect(state.resetState).toHaveBeenCalled();
  });
  it('apre le consegne da programmare con un filtro dedicato e rimovibile', () => {
    component.openOrders('programmare');
    const filtro = state.setState.calls.mostRecent().args[0];
    expect(filtro.consegneDaProgrammare).toBeTrue();
    expect(filtro.filtroStatus).toBe('TUTTI');
    expect(filtro.senzaBolla).toBeFalse();
    expect(state.resetState).toHaveBeenCalled();
    component.openOrders('all');
    expect(state.setState.calls.mostRecent().args[0].consegneDaProgrammare).toBeFalse();
  });
  it('apre il pronto consegna e poi tutti gli ordini con filtri distinti', () => {
    component.openOrders('pronto');
    expect(state.setState.calls.mostRecent().args[0].prontoConsegna).toBeTrue();
    component.openOrders('all');
    expect(state.setState.calls.mostRecent().args[0].prontoConsegna).toBeFalse();
    expect(state.setState.calls.mostRecent().args[0].daCodificare).toBeFalse();
  });
  it('i nuovi avvisi aprono lo stesso filtro e le firme aprono gli archiviati', () => {
    component.openOrders('carichi');
    expect(state.setState.calls.mostRecent().args[0].carichiDaProcessare).toBeTrue();
    component.openOrders('bolle');
    expect(state.setState.calls.mostRecent().args[0].senzaBolla).toBeTrue();
    component.openOrders('firme');
    expect(state.setState.calls.mostRecent().args[0].senzaFirma).toBeTrue();
    expect(state.setState.calls.mostRecent().args[0].filtroStatus).toBe('ARCHIVIATO');
  });
  it('apre esattamente l’ordine del carico senza riusare vecchi filtri', () => {
    component.openCarico({anno: 2026, serie: '14', progressivo: 123, cliente: 'Cliente', dataCarico: null, giorni: null});
    expect(state.resetState).toHaveBeenCalled();
    const filtro = state.setState.calls.mostRecent().args[0];
    expect(filtro.anno).toBe(2026);
    expect(filtro.codVenditore).toBe('14');
    expect(filtro.progressivo).toBe(123);
    expect(filtro.carichiDaProcessare).toBeTrue();
  });
  it('in caso di errore non mostra contatori precedenti come aggiornati', () => {
    component.load();
    expect(component.data?.ordiniAttivi).toBe(12);
    service.get.and.returnValue(throwError(() => new Error('rete')));
    component.load();
    expect(component.data).toBeNull();
    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
  });
});

describe('DashboardComponent: contenuto visibile', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [CommonModule, RouterTestingModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
      providers: [
        {provide: DashboardService, useValue: {get: () => of({ordiniAttivi: 12, daCodificare: null, daOrdinare: 8, prontoConsegna: 4, consegneDaProgrammare: 2, carichiDaProcessare: 1, senzaBolla: 0, archiviatiSenzaFirma: null, carichiPiuVecchi: [{anno: 2026, serie: '14', progressivo: 123, cliente: 'Cliente', dataCarico: null, giorni: null}]})}},
        {provide: AuthService, useValue: {getCurrentUser: () => ({username: 'Anna'})}},
        {provide: PermissionService, useValue: {canViewOrdiniClienti: true, canViewLogistica: true}},
        {provide: OrdiniClientiStateService, useValue: {resetState: () => {}, setState: () => {}}}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  it('mostra i contatori ricevuti e nasconde quelli non autorizzati', () => {
    const content = fixture.nativeElement as HTMLElement;
    expect(content.textContent).toContain('Ciao, Anna.');
    expect(content.querySelectorAll('.counter-card').length).toBe(6);
    expect(content.textContent).not.toContain('Ordini da codificare');
    expect(content.textContent).toContain('Pronto consegna');
    expect(content.textContent).toContain('Da ordinare');
    expect(content.textContent).toContain('Consegne da programmare');
    expect(content.textContent).toContain('Data carico non disponibile');
    expect(content.querySelectorAll('.pending-order').length).toBe(1);
    expect(content.textContent).not.toContain('Archiviati senza firma');
  });
});
