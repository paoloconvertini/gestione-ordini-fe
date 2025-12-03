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

  get canProntoConsegna() { return this.auth.hasPerm('ordini_clienti.pronto_consegna'); }
  get canFiltroVenditore() { return this.auth.hasPerm('ordini_clienti.filtro_venditore'); }
  get canEditStato() { return this.auth.hasPerm('ordini_clienti.edit_stato'); }
  get canSblocca() { return this.auth.hasPerm('ordini_clienti.sblocca'); }
  get canDownloadOrdine() { return this.auth.hasPerm('ordini_clienti.download'); }
  get canFirmaCliente() { return this.auth.hasPerm('ordini_clienti.firma_cliente'); }
  get canInviaEmail() { return this.auth.hasPerm('ordini_clienti.invia_email'); }
  get canRiapriOrdine() { return this.auth.hasPerm('ordini_clienti.riapri'); }
  get canWarnNonFirmato() { return this.auth.hasPerm('ordini_clienti.warn_non_firmato'); }
  get canNoteLogistica() { return this.auth.hasPerm('ordini_clienti.note_logistica'); }

  get canRedirectAmministrativo() {
    return this.auth.hasPerm('login.redirect.amministrativo');
  }

  get canRedirectLogistica() {
    return this.auth.hasPerm('login.redirect.logistica');
  }

  get canRedirectDefault() {
    return this.auth.hasPerm('login.redirect.default');
  }

  get canUnisciOrdini() {
    return this.auth.hasPerm('ordini_fornitori.unisci');
  }

  get canEditFlInviato() {
    return this.auth.hasPerm('ordini_fornitori.flInviato.edit');
  }

  get canRiapriOrdineFornitore() {
    return this.auth.hasPerm('ordini_fornitori.riapri');
  }

  get canEliminaOrdineFornitore() {
    return this.auth.hasPerm('ordini_fornitori.elimina');
  }

  get canSalvaOrdiniFornitore() {
    return this.auth.hasPerm('ordini_fornitori.salva');
  }

  get canViewOaf() {
    return this.auth.hasPerm('oaf.view');
  }

  get canEditOaf() {
    return this.auth.hasPerm('oaf.edit');
  }

  get canOverrideStatus() {
    return this.auth.hasPerm('oaf.override_status');
  }

  get canUpdateStatoLogistica() {
    return this.auth.hasPerm('logistica.update_stato');
  }

  get canUpdateVeicolo() {
    return this.auth.hasPerm('logistica.update_veicolo');
  }

  get canCercaBolle() {
    return this.auth.hasPerm('logistica.cerca_bolle');
  }

  get canDefaultLogisticaCompleto() {
    return this.auth.hasPerm('logistica.default_completo');
  }

  get canSelectBolla() {
    return this.auth.hasPerm('ordine.bolla.seleziona');
  }


}
