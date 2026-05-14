# Build static assets (VITE_API_BASE_URL prázdne = relatívne /api/v1 cez nginx proxy)
FROM node:22-alpine AS build
WORKDIR /app
# Build Vite môže byť pamäťovo náročný na malom VPS
ENV NODE_OPTIONS=--max-old-space-size=3072

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
# Meno služby Spring Boot v docker-compose (ak premenujete službu, zmeňte aj tu / v compose)
ENV BACKEND_HOST=backend
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
