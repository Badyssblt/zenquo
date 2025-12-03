# Dockerfile pour Zenquo (Nuxt 4)
ARG NODE_VERSION=25

# Stage 1: Base
FROM node:${NODE_VERSION}-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm ci

# Stage 3: Development
FROM base AS development

WORKDIR /app

# Copier les node_modules depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copier tout le code source
COPY . .

# Exposer le port Nuxt
EXPOSE 3000

# Démarrer en mode dev
CMD ["npm", "run", "dev"]


