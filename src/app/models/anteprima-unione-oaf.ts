export interface OrdineUnioneOaf {
  anno: number;
  serie: string;
  progressivo: number;
  gruppo?: number;
  conto?: string;
  intestazione?: string;
}
export interface AnteprimaUnioneOaf {
  ordini: OrdineUnioneOaf[];
  fornitoriDiversi: boolean;
  versione: string;
}
