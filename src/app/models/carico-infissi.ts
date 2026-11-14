export interface RigaCaricoInfissi {
  progrGenerale: number;
  quantita: number;
}
export interface RichiestaCaricoInfissi {
  articoli: RigaCaricoInfissi[];
  totaleImponibile: number;
  numDoc: string;
  dataOperazione: string;
  dataDocumento: string;
  causale: string;
  vettore: string;
}
export interface RipartizioneCaricoInfissi {
  totaleImponibile: number;
  quantitaTotale: number;
  costoUnitario: number;
  righe: {progrGenerale: number; rigo: number; articolo: string; descrizione: string; quantita: number; imponibile: number}[];
}
