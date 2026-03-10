import {FasciaConsegne} from "./FasciaConsegne";

export interface GiornoConsegne {
  giorno: string;
  data: string | Date;
  numeroConsegne: number;
  fasce: FasciaConsegne[];
}
