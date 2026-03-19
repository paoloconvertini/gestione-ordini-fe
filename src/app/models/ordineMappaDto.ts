export interface OrdineMappaDto {
  anno: number;
  serie: string;
  progressivo: number;
  latitudine: number;
  longitudine: number;

  intestazione: string;
  indirizzo: string;
  telefono?: string;
  cellulare?: string;

  sottoConto: string;

  ordine?: number;
  oraConsegna?: 'M' | 'P';
  idVeicolo?: number;
  localita?: string;
}
