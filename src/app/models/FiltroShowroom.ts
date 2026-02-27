export class FiltroShowroom {

  dataDa: Date | null = null;
  dataA: Date | null = null;

  nomeCliente: string | null = null;

  provincia: string | null = null;
  comuneIstat: string | null = null;

  page: number = 0;
  size: number = 10;

  sedeId?: number | null;
}
