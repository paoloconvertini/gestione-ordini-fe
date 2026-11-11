export class FiltroOrdini {

  filtroStatus: string = '';

  statusOrdine: any;

  codVenditore:  string = '';

  prontoConsegna: boolean = false;

  daCodificare: boolean = false;

  daOrdinareModificati: boolean = false;

  carichiDaProcessare: boolean = false;

  senzaBolla: boolean = false;

  senzaFirma: boolean = false;

  consegneDaProgrammare: boolean = false;

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
  filtroInvio: string = 'tutti';

}
