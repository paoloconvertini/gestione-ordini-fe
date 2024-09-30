export class OrdineDettaglio{
  anno?: number
  serie?: string
  progressivo?: number
  articoli?: any[]
  sottoConto: string = ''
  intestazione:string = ''
  dataOrdine: any
  modalitaPagamento: string = ''
  riferimento:string = ''
  telefono: string = ''
  cellulare: string = ''
  locked: boolean = false
  userLock: string = ''
  totale: number = 0
  noteLogistica: string = ''
  userNoteLogistica: string = ''
  dataNoteLogistica: any
}
