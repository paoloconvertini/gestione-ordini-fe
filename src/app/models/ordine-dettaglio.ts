export class OrdineDettaglio{
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
}
