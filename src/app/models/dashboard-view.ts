import {FiltroOrdini} from './FiltroOrdini';

export const DASHBOARD_VIEWS: {[tipo: string]: string} = {
  all: 'Ordini attivi', ordinare: 'Da ordinare', modificati: 'Da ordinare modificati',
  codifica: 'Ordini da codificare', pronto: 'Pronto consegna',
  programmare: 'Consegne da programmare', bolle: 'Consegnati senza bolla', firme: 'Archiviati senza firma'
};

export function filtroDashboard(tipo: string): FiltroOrdini {
  const filtro = new FiltroOrdini();
  filtro.dashboardTipo = tipo === 'carichi' ? '' : tipo;
  filtro.filtroStatus = tipo === 'firme' ? 'ARCHIVIATO' : ['ordinare', 'modificati'].includes(tipo) ? 'DA_ORDINARE' : 'TUTTI';
  filtro.daCodificare = tipo === 'codifica';
  filtro.daOrdinareModificati = tipo === 'modificati';
  filtro.prontoConsegna = tipo === 'pronto';
  filtro.carichiDaProcessare = tipo === 'carichi';
  filtro.senzaBolla = tipo === 'bolle';
  filtro.senzaFirma = tipo === 'firme';
  filtro.consegneDaProgrammare = tipo === 'programmare';
  filtro.daOrdinareConNote = tipo === 'note';
  return filtro;
}
