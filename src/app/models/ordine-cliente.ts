import {ArticoloCliente} from "./ArticoloCliente";

export class OrdineCliente {
  anno?: number
  serie?: string
  progressivo?: number
  intestazione?: string
  dataOrdine?: Date
  numeroConferma?: string
  email?: string
  sottoConto?:string
  note?: string
  noteLogistica?: string
  status?: string
  userNote:any
  dataNote:any
  userNoteLogistica:any
  dataNoteLogistica:any
  articoli: ArticoloCliente[] = [];
}
