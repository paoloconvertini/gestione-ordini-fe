# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

ENV CI=true \
    npm_config_audit=false \
    npm_config_fund=false \
    npm_config_progress=false \
    npm_config_foreground_scripts=true \
    TZ=Europe/Rome

COPY package.json package-lock.json ./
RUN npm i -g npm@10
RUN npm ci --no-audit --no-fund --no-optional

COPY . .
RUN npm run build -- --configuration=production

# ---------- Runtime ----------
FROM nginx:alpine AS runtime

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build
COPY --from=build /app/dist/gestione-ordini /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
