export interface PagamentoOrdine {
  progrGenerale: number;
  anno: number;
  serie: string;
  progressivo: number;
  rigo: number;
  articolo: string;
  percentuale: number | null;
  dataPrevista: string | null;
  dataScadenza: string | null;
  descrizioneScritta: string;
  anomalia: string;
  cliente: string;
  statoOrdine: string;
  stato: 'DA_FATTURARE' | 'ANOMALIA' | 'PROGRAMMATO' | 'AL_PRONTO' | 'EMESSO' | 'NON_DOVUTO';
  importoPrevisto: number | null;
  importoFatturato: number | null;
  fatture: string;
  controllatoIl: string;
}
