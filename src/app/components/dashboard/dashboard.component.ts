import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../baseComponent';
import { Dashboard, DashboardCarico, DashboardService } from '../../services/dashboard/dashboard.service';
import { AuthService } from '../../services/auth/auth.service';
import { PermissionService } from '../../services/auth/permission.service';
import { OrdiniClientiStateService } from '../../services/state/ordini-clienti-state.service';
import { FiltroOrdini } from '../../models/FiltroOrdini';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  data: Dashboard | null = null;
  loading = false;
  error = false;
  updatedAt: Date | null = null;
  todayLabel = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  username = this.auth.getCurrentUser()?.username || '';

  constructor(private service: DashboardService, private auth: AuthService,
              public perm: PermissionService, private state: OrdiniClientiStateService,
              private router: Router) { super(); }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = false;
    this.data = null;
    this.service.get().pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: data => {
        this.data = data;
        this.updatedAt = new Date();
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  openCarico(carico: DashboardCarico): void {
    const filtro = new FiltroOrdini();
    filtro.filtroStatus = 'TUTTI';
    filtro.carichiDaProcessare = true;
    filtro.anno = carico.anno;
    filtro.codVenditore = carico.serie;
    filtro.progressivo = carico.progressivo;
    this.state.resetState();
    this.state.setState(filtro);
    this.router.navigate(['/ordini-clienti']);
  }

  openOrders(type: 'all' | 'programmare' | 'ordinare' | 'modificati' | 'codifica' | 'pronto' | 'carichi' | 'bolle' | 'firme'): void {
    const filtro = new FiltroOrdini();
    filtro.filtroStatus = type === 'firme' ? 'ARCHIVIATO' : (type === 'ordinare' || type === 'modificati') ? 'DA_ORDINARE' : 'TUTTI';
    filtro.daCodificare = type === 'codifica';
    filtro.daOrdinareModificati = type === 'modificati';
    filtro.prontoConsegna = type === 'pronto';
    filtro.carichiDaProcessare = type === 'carichi';
    filtro.senzaBolla = type === 'bolle';
    filtro.senzaFirma = type === 'firme';
    filtro.consegneDaProgrammare = type === 'programmare';
    this.state.resetState();
    this.state.setState(filtro);
    this.router.navigate(['/ordini-clienti']);
  }
}
