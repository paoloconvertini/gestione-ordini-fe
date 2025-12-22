import { Injectable } from '@angular/core';
import {FiltroOrdini} from "../../../models/FiltroOrdini";

const STORAGE_KEY = 'OAF_STATE';

@Injectable({
  providedIn: 'root'
})
export class OrdiniFornitoreStateService {

  private state: FiltroOrdini = new FiltroOrdini();

  constructor() {
    this.loadFromStorage();
  }

  /** Ritorna una copia dello stato */
  getState(): FiltroOrdini {
    return JSON.parse(JSON.stringify(this.state));
  }

  /** Aggiorna lo stato (merge parziale) */
  setState(partial: Partial<FiltroOrdini>): void {
    this.state = { ...this.state, ...partial };
    this.saveToStorage();
  }

  /** Reset completo */
  resetState(): void {
    this.state = new FiltroOrdini();
    // Default richiesto: appena entri nella pagina = Sospesi
    this.state.filtroStatus = 'F';
    this.saveToStorage();
  }

  /** Logout = pulizia totale */
  clearOnLogout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.resetState();
  }

  /** Persistenza */
  private saveToStorage(): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private loadFromStorage(): void {
    const json = sessionStorage.getItem(STORAGE_KEY);
    if (!json) {
      // Se non esiste niente → default = Sospesi
      this.resetState();
      return;
    }

    try {
      const parsed = JSON.parse(json);
      this.state = { ...this.state, ...parsed };
    } catch {
      // Se c’è errore → reset pulito
      this.resetState();
    }
  }
}

