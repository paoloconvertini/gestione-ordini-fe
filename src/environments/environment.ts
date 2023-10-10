// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  TOKEN_KEY: 'access_token',
  USERNAME: 'username',
  MAGAZZINIERE: 'Magazziniere',
  AMMINISTRATIVO: 'Amministrativo',
  ADMIN: 'Admin',
  VENDITORE: 'Venditore',
  LOGISTICA: 'Logistica',
  production: false,
  baseUrl: 'http://localhost:8080/api/',
  baseAuthUrl: 'http://localhost:8081/api/',
  LOGIN: 'login',
  ORDINI_CLIENTI: 'ordini-clienti',
  ARTICOLI_BY_NUM_ORDINE: "articoli",
  VEICOLO: "veicoli",
  REGISTRO: "registro",
  EMAIL: "mail",
  OAF: 'oaf',
  OAF_ARTICOLI: '/articoli',
  PIANOCONTI: 'pianoconti',
  USER: 'users',
  ROLE: 'roles',
  BOX_DOCCIA: 'box-doccia'
  //DBX_ACCESS_TOKEN: (window as any)['env']['dbxAccessToken']
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
