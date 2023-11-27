(function(window) {
  window.__env = window.__env || {};    // Environment variables
  window["env"]['baseUrl'] = '${BACKEND_BASE_URL}';
  window["env"]['baseUrlCeglie'] = '${BACKEND_BASE_C_URL}';
  window["env"]['baseUrlOstuni'] = '${BACKEND_BASE_O_URL}';
  window['env']['baseAuthUrl'] = '${BACKEND_BASE_AUTH_URL}';
//  window['env']['dbxAccessToken'] = '${DBX_ACCESS_TOKEN}';
})(this);
