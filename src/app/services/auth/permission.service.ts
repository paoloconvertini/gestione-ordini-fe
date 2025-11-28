import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private auth: AuthService) {}

  // Navigation permissions
  get canViewUsers() {
    return this.auth.hasPerm('users.view');
  }

  get canViewRoles() {
    return this.auth.hasPerm('roles.view');
  }

  get canViewOrdiniClienti() {
    return this.auth.hasPerm('ordini_clienti.view');
  }

  get canProcessOrdiniClienti() {
    return this.auth.hasPerm('ordini_clienti.processare');
  }

  get canViewOrdiniFornitori() {
    return this.auth.hasPerm('ordini_fornitori.view');
  }

  get canViewAnalisi() {
    return this.auth.hasPerm('analisi_dati.view');
  }

  get canViewSituazioneOrdini() {
    return this.auth.hasPerm('analisi_dati.situazione_ordini');
  }

  get canViewContabilita() {
    return this.auth.hasPerm('contabilita.view');
  }
}
