export class OrdineDettaglio{
  articoli?: any[]
  sottoConto: string = ''
  intestazione:string = ''
  locked: boolean = false
  userLock: string = ''
  totale: number = 0;
}