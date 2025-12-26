# Dockerfile pour le client web AREA
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*

# Copier les fichiers de configuration
COPY package*.json ./
COPY nuxt.config.ts ./

# Installer les dépendances
RUN npm ci --only=production=false

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

EXPOSE 8081

# Variables d'environnement pour Nuxt
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8081
ENV NODE_ENV=production

CMD ["npm", "run", "preview"]