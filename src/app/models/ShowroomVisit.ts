export interface ShowroomVisit {

  id: number;

  nomeCliente: string;
  telefono: string;

  comuneIstat: string;
  comuneNome: string;
  provinciaSigla: string;

  motivoId: number;
  motivoDescrizione: string;

  venditoreCodice: string;
  venditoreNome: string;

  dataVisita: Date;
}
