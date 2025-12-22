import { Injectable } from '@angular/core';
import { FiltroOrdini } from '../../models/FiltroOrdini';

const STORAGE_KEY = 'OC_STATE';

@Injectable({
  providedIn: 'root'
})
export class OrdiniClientiStateService {

  private state: FiltroOrdini = new FiltroOrdini();

  constructor() {
    console.log('[STATE] constructor');
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
    console.log('[STATE] resetState');
    this.state = new FiltroOrdini();
    // status di default identico al tuo vecchio comportamento
    this.state.filtroStatus = 'TUTTI';
    this.saveToStorage();
  }

  /** Logout = pulizia totale */
  clearOnLogout(): void {
    console.log('[STATE] clearOnLogout');

    sessionStorage.removeItem(STORAGE_KEY);
    this.resetState();
  }

  /** Persistenza */
  private saveToStorage(): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private loadFromStorage(): void {
    console.log('[STATE] loadFromStorage start');
    const json = sessionStorage.getItem(STORAGE_KEY);
    console.log('[STATE] stored json =', json);
    if (!json) return;

    try {
      const parsed = JSON.parse(json);
      this.state = { ...this.state, ...parsed };
    } catch {
      this.resetState();
    }
  }
}
