# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Impostazioni che riducono i glitch di npm e rendono i log più puliti
ENV CI=true \
    npm_config_audit=false \
    npm_config_fund=false \
    npm_config_progress=false \
    npm_config_foreground_scripts=true \
    TZ=Europe/Rome

# 1) Copia solo i manifest per sfruttare la cache
COPY package.json package-lock.json ./

# 2) Aggiorna npm a 10 (elimina i bug di npm 9)
RUN npm i -g npm@10

# 3) Install deterministico, senza optional (utile su Alpine)
RUN npm ci --no-audit --no-fund --no-optional

# 4) Ora copia il resto del progetto
COPY . .

# 5) Build Angular (non usare --omit=dev qui!)
#    Se il tuo script è "build": "ng build --configuration=production"
RUN npm run build -- --configuration=production

# ---------- Runtime ----------
FROM nginx:alpine AS runtime

# (Opzionale) assicurati che envsubst ci sia: in alcune immagini non è presente
RUN apk add --no-cache gettext

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia la build (occhio al path: usa quello che generi davvero)
COPY --from=build /app/dist/gestione-ordini /usr/share/nginx/html

EXPOSE 80

# Sostituzione variabili in env.js all'avvio
CMD ["/bin/sh","-c","envsubst < /usr/share/nginx/html/assets/env.sample.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
