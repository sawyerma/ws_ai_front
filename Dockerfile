# Multi-stage build für optimierte Größe
FROM node:18-alpine AS builder

WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# Quellcode kopieren
COPY . .

# Build durchführen
RUN npm run build

# Production stage mit nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
