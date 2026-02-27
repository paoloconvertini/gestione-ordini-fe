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

  get canViewMotivi() {
    return this.auth.hasPerm('motivi.view');
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

  get canViewListaCarico() {
    return this.auth.hasPerm('lista_carico.view');
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
    return this.auth.hasPerm('login.redirect.amministrativo')
      && !this.auth.hasRole('Admin');
  }
  get canViewLogistica() {
    return this.auth.hasPerm('logistica.view');
  }

  get canRedirectLogistica() {
    return this.auth.hasPerm('login.redirect.logistica')
      && !this.auth.hasRole('Admin');
  }

  get canRedirectDefault() {
    // Admin rientra SEMPRE qui
    return this.auth.hasPerm('login.redirect.default')
      || this.auth.hasRole('Admin');
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

// === Articoli: Azioni Generali ===
  get canCreaOrdineForn() {
    return this.auth.hasPerm('articoli.crea_ordine_fornitore');
  }

  get canCaricaMagazzino() {
    return this.auth.hasPerm('articoli.carica_magazzino');
  }

  get canCodificaArticoli() {
    return this.auth.hasPerm('articoli.codifica_articoli');
  }

  get canCreaFatturaAcconto() {
    return this.auth.hasPerm('articoli.crea_fattura_acconto');
  }

  get canViewRegistroVisite(): boolean {
    return this.auth.hasPerm('showroom.view');
  }

  get canFilterSede() {
    return this.auth.hasPerm('showroom.sede.filter');
  }

// canSelectBolla → già esiste (ordine.bolla.seleziona)

// note logistica → già esiste: canNoteLogistica

// === Articoli: Filtri ===
  get canFiltroNonDisponibile() {
    return this.auth.hasPerm('articoli.filtro_non_disponibile');
  }

  get canFiltroConsegnaAdmin() {
    return this.auth.hasPerm('articoli.filtro_consegna_admin');
  }

  get canDefaultFiltroNonDisponibile() {
    return this.auth.hasPerm('articoli.default_filtro_non_disponibile');
  }

// === Articoli: Campi Rigo ===
  get canEditDescrizione() {
    return this.auth.hasPerm('articoli.edit_descrizione');
  }

  get canEditCodiceFornitore() {
    return this.auth.hasPerm('articoli.edit_codice_fornitore');
  }

  get canEditQuantita() {
    return this.auth.hasPerm('articoli.edit_quantita');
  }

  get canEditTono() {
    return this.auth.hasPerm('articoli.edit_tono');
  }

  get canEditQtaRiservata() {
    return this.auth.hasPerm('articoli.edit_qta_riservata');
  }

  get canEditQtaProntoConsegna() {
    return this.auth.hasPerm('articoli.edit_qta_pronto_consegna');
  }

  get canEditNonDisponibile() {
    return this.auth.hasPerm('articoli.edit_non_disponibile');
  }

// === Articoli: Flag Ordinato / Pronto Cons. / Consegnato ===
  get canEditOrdinato() {
    return this.auth.hasPerm('articoli.edit_flag_ordinato');
  }

  get canEditOrdinato943() {
    return this.auth.hasPerm('articoli.edit_flag_ordinato_943');
  }

  get canEditProntoConsegna() {
    return this.auth.hasPerm('articoli.edit_flag_pronto_consegna');
  }

  get canEditConsegnato() {
    return this.auth.hasPerm('articoli.edit_flag_consegnato');
  }

// === Articoli: Qta Senza Bolla ===
  get canEditQtaConsegnatoSenzaBolla() {
    return this.auth.hasPerm('articoli.edit_qta_senza_bolla');
  }

// === Articoli: Azioni Rigo ===
  get canAssociaFornitore() {
    return this.auth.hasPerm('articoli.associa_fornitore');
  }

  get canViewNoteOAF() {
    return this.auth.hasPerm('articoli.view_note_oaf');
  }

// === Articoli: Salvataggio e Chiusura ===
  get canSalvaArticoli() {
    return this.auth.hasPerm('articoli.salva');
  }

  get canChiudiArticoli() {
    return this.auth.hasPerm('articoli.chiudi');
  }

}
