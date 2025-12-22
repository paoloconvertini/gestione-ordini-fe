export interface OrdineMappaDto {
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
}
