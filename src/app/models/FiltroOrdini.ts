export class FiltroOrdini {

  status: string = '';

  codVenditore:  string = '';

  prontoConsegna: boolean = false;

  searchText: string = '';

  veicolo: any;

  dataConsegnaStart: any;

  dataConsegnaEnd: any;

  flInviato:boolean = false;

  page:number = 0;

  size:number = 10;
  anno: any;
  progressivo: any;
  cliente: any;
  luogo: any;
  dataOrdine: any;
  deltaSettimana:number =0;

}
