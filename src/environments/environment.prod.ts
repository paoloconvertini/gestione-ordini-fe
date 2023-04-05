export const environment = {
  TOKEN_KEY: 'access_token',
  USERNAME: 'username',
  MAGAZZINIERE: 'Magazziniere',
  AMMINISTRATIVO: 'Amministrativo',
  ADMIN: 'Admin',
  VENDITORE: 'Venditore',
  production: false,
  baseUrl: (window as any)["env"]['baseUrl'] || 'http://192.168.1.150:8080/api/v1',
  baseAuthUrl: (window as any)['env']['baseAuthUrl'] || 'http://192.168.1.150:8081/api/v1/',
  LOGIN: 'login',
  ORDINI_CLIENTI: 'ordini-clienti',
  ARTICOLI_BY_NUM_ORDINE: "articoli",
  REGISTRO: "registro",
  EMAIL: "mail",
  OAF: 'oaf',
  OAF_ARTICOLI: '/articoli'
};
