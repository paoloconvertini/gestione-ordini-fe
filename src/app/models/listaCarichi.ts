import {Deposito} from "./deposito";
import {Trasportatore} from "./trasportatore";

export class ListaCarichi {
  id: string = ''
  azienda: string = ''
  numeroOrdine: string = ''
  idDeposito: number = 0;
  deposito: string = ''
  dataDisponibile: any
  peso: number = 0
  idTrasportatore: number = 0;
  trasportatore: string = ''
  numeroConvalida: string = ''

}
