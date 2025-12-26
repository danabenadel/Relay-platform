# Frontend Action-Reaction - Documentation Développeur

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation et démarrage](#installation-et-démarrage)
- [Structure des dossiers](#structure-des-dossiers)
- [Composants](#composants)
- [Ajouter de nouvelles fonctionnalités](#ajouter-de-nouvelles-fonctionnalités)
- [Design System](#design-system)
- [API et Backend](#api-et-backend)
- [Docker](#docker)
- [Outils de développement](#outils-de-développement)

---

## Vue d'ensemble

Le frontend d'Action-Reaction est une application web moderne construite avec **Nuxt.js 4** et **Tailwind CSS v4.1**.  
Il s'agit d'une plateforme d'automatisation similaire à IFTTT/Zapier permettant aux utilisateurs de connecter leurs services préférés et créer des workflows automatisés.

### Technologies principales

- **Framework** : Nuxt.js 4 (Vue.js 3)
- **Styling** : Tailwind CSS v4.1 (nouvelle syntaxe sans config)
- **UI Components** : @nuxt/ui
- **TypeScript** : Support natif
- **Containerisation** : Docker

---

## Architecture

### Philosophie de conception

- Composants réutilisables : Chaque élément UI est un composant indépendant
- Séparation des responsabilités : Pages, composants, composables et utilitaires séparés
- API-first : Toutes les données viennent du backend via REST API
- Modulaire : Facile d'ajouter de nouveaux services et fonctionnalités

### Flux de données

```
API Backend (port 8080) ↔ Composables ↔ Pages ↔ Composants ↔ UI
```

---

## Installation et démarrage

### Prérequis

- Node.js 20+
- Docker et Docker Compose

### Installation locale

```bash
git clone [repo-url]
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Avec Docker

```bash
docker-compose up -d client_web
```

Application disponible sur `http://localhost:8081`.

---

## Structure des dossiers

```
frontend/
├── app/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── composables/
│   ├── middleware/
│   ├── plugins/
│   ├── utils/
│   └── assets/
├── public/
├── app.vue
├── nuxt.config.ts
├── package.json
├── Dockerfile
└── README.md
```

---

## Composants

### Exemples

**ServiceCard.vue**

```vue
<ServiceCard
  :service="serviceData"
  :is-connected="true"
  @connect="handleConnect"
  @disconnect="handleDisconnect"
/>
```

**AreaCard.vue**

```vue
<AreaCard :area="areaData" @toggle="toggleArea" @delete="deleteArea" />
```

**NotificationToast.vue**

```vue
<NotificationToast
  :show="notification.show"
  :type="notification.type"
  :title="notification.title"
  :message="notification.message"
  @close="hideNotification"
/>
```

### Convention

- Props : camelCase (`isConnected`)
- Events : kebab-case (`@view-details`)
- Composants : PascalCase (`AreaCard`)

---

## Ajouter de nouvelles fonctionnalités

### Nouvelle page

```vue
<template>
  <h1>Nouvelle page</h1>
</template>

<script setup>
useHead({ title: "Nouvelle page" });
</script>
```

Accessible automatiquement via `/nouvelle-page`.

### Nouveau composant

```vue
<MonComposant title="Test" description="Description" @action="handleAction" />
```

### Nouveau service

```javascript
const newService = {
  name: "notion",
  icon: "📝",
  description: "Workspace tout-en-un",
  apiUrl: "https://api.notion.com",
};
```

---

## Design System

### Styles Tailwind

- `bg-white/10`, `backdrop-blur-xl`, `shadow-2xl`
- Transitions : `hover:scale-105 transition-all duration-300`

### Exemples UI

```vue
<button
  class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl"
>
  Mon bouton
</button>
```

---

## API et Backend

### Exemple d’appel API

```typescript
const { $api } = useApi();
const services = await $api("/services");
```

### Endpoints attendus

- `GET /about.json`
- `POST /auth/login`
- `POST /auth/register`
- `GET /user/services`
- `POST /areas`
- `GET /areas`

---

## Docker

### Commandes utiles

```bash
docker-compose build client_web
docker-compose up -d client_web
docker-compose logs -f client_web
docker-compose restart client_web
```

---

## Outils de développement

### Scripts

```bash
npm run dev
npm run build
npm run preview
npm run generate
```

### Linting

```bash
npm run lint
npm run lint:fix
```

---

## Contribution

### Workflow

1. Créer une branche par fonctionnalité
2. Faire une revue de code
3. Tester avant merge
4. Fusionner dans `main`

### Standards

- Noms explicites
- Composants simples
- TypeScript privilégié
- Commenter la logique complexe
