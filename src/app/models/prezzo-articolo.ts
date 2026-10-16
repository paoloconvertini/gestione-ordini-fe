export interface GiacenzaMagazzino {
  magazzino: string;
  giacenza: number;
}

export interface PrezzoArticolo {
  articolo: string;
  descrizione: string;
  giacenzaTotale: number;
  giacenze: GiacenzaMagazzino[];
  unitaMisura: string | null;
  unitaAcquisto: string | null;
  bloccato: string | null;
  costoUltimo: number | null;
  costoRiferimento: number | null;
  costoRettificato: boolean;
  prezzoBase: number | null;
  ricaricoAttuale: number | null;
  nuovoPrezzo: number | null;
  movimento: number | null;
  dataUltimoAcquisto: string | null;
  motivoEsclusione: string | null;
  aggiornabile: boolean;
}

export interface PrezziArticoli {
  articoli: PrezzoArticolo[];
  ricaricoImpostato: number | null;
}

export interface AggiornamentoPrezzi {
  classeA1: string;
  percentuale: number;
  ricaricoImpostato: number | null;
  includiBloccati: boolean;
  articoli: PrezzoArticolo[];
  percentualeDeselezionati?: number;
  articoliDeselezionati?: PrezzoArticolo[];
  portaASoglia?: boolean;
}
