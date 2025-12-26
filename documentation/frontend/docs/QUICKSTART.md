# Guide de Démarrage Rapide - Frontend AREA

Ce guide vous permet de démarrer rapidement sur le projet frontend AREA.

## Installation en 5 Minutes

### 1. Prérequis

Vérifiez que vous avez :

```bash
node --version   # v18+ requis
npm --version    # v9+ requis
```

Si Node.js n'est pas installé : https://nodejs.org/

### 2. Installation des Dépendances

```bash
cd frontend
npm install
```

### 3. Configuration de l'Environnement

Créez un fichier `.env` à la racine de `/frontend` :

```bash
# .env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 4. Lancer le Serveur de Développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

### 5. Vérification

Ouvrez votre navigateur sur http://localhost:3000 et vérifiez que :
- La page d'accueil s'affiche
- Vous pouvez naviguer vers `/login`
- Le design glassmorphique est bien appliqué

---

## Structure du Projet en 2 Minutes

```
frontend/app/
├── components/        #  Composants Vue réutilisables
│   ├── AREA/         # Configs des services (Spotify, Discord, etc.)
│   └── ...
├── composables/      #  Logique métier (useApi, useAuth)
├── pages/            #  Pages (routing auto)
│   ├── areas/
│   │   └── create.vue  # Wizard de création d'AREA
│   └── login.vue
├── assets/css/       # Styles globaux
└── middleware/       # Guards de routes
```

**Règle simple** :
- **Composant réutilisable** → `/components`
- **Logique métier** → `/composables`
- **Nouvelle page** → `/pages`

---

## Créer Votre Premier Composant

### 1. Créer le fichier

```bash
touch frontend/app/components/MyComponent.vue
```

### 2. Code du composant

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string;
}>();

const count = ref(0);
</script>

<template>
  <div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
    <h3 class="text-xl font-semibold text-white mb-4">{{ title }}</h3>
    <p class="text-white/70">Count: {{ count }}</p>
    <button
      @click="count++"
      class="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
    >
      Increment
    </button>
  </div>
</template>
```

### 3. Utiliser le composant

```vue
<!-- Dans n'importe quelle page -->
<template>
  <MyComponent title="Mon Composant" />
</template>
```

**Note** : Pas besoin d'import ! Nuxt auto-importe tous les composants.

---

## Créer Votre Première Page

### 1. Créer le fichier

```bash
touch frontend/app/pages/my-page.vue
```

### 2. Code de la page

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth', // Protection de la route
});

useHead({
  title: 'Ma Page - Relay',
});

const data = ref('Hello World');
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-white">Ma Page</h1>
      <p class="text-white/70 mt-4">{{ data }}</p>
    </div>
  </div>
</template>
```

### 3. Accéder à la page

Allez sur http://localhost:3000/my-page

**URL automatique** : Le fichier `pages/my-page.vue` devient la route `/my-page`

---

## Faire un Appel API

### 1. Utiliser le composable `useApi`

```vue
<script setup>
const { $api } = useNuxtApp();

// GET
const areas = ref([]);
const loadAreas = async () => {
  areas.value = await $api('/api/areas');
};

// POST
const createArea = async (data) => {
  const newArea = await $api('/api/areas', {
    method: 'POST',
    body: data,
  });
  console.log('Created:', newArea);
};

// DELETE
const deleteArea = async (id) => {
  await $api(`/api/areas/${id}`, {
    method: 'DELETE',
  });
};

onMounted(() => {
  loadAreas();
});
</script>

<template>
  <div v-for="area in areas" :key="area.id">
    {{ area.name }}
  </div>
</template>
```

**Avantages** :
- Token d'auth automatiquement ajouté
- Gestion d'erreurs globale
- Auto-logout sur 401

---

## Ajouter un Service (Version Rapide)

Pour ajouter un nouveau service (ex: Twitch), suivez ces 3 étapes :

### 1. Backend : Ajouter dans `/about.json`

```json
{
  "name": "twitch",
  "actions": [
    {
      "name": "stream_started",
      "description": "Quand un stream démarre"
    }
  ],
  "reactions": [
    {
      "name": "send_chat_message",
      "description": "Envoyer un message dans le chat"
    }
  ]
}
```

### 2. Frontend : Créer `TwitchActionConfig.vue`

```bash
touch frontend/app/components/AREA/TwitchActionConfig.vue
```

```vue
<script setup lang="ts">
const props = defineProps<{
  actionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

const localConfig = ref({ ...props.config });

const updateConfig = () => {
  emit('update:config', localConfig.value);
};
</script>

<template>
  <div v-if="actionType === 'stream_started'">
    <label class="block text-sm font-medium text-white mb-2">
      Nom du channel
    </label>
    <input
      v-model="localConfig.channelName"
      @input="updateConfig"
      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
    />
  </div>
</template>
```

### 3. Frontend : Importer dans `create.vue`

```vue
<!-- pages/areas/create.vue -->
<script setup>
// Ajouter l'import
import TwitchActionConfig from '~/components/AREA/TwitchActionConfig.vue';

// Ajouter au mapping
const actionConfigComponents = {
  // ... autres services
  twitch: TwitchActionConfig,
};
</script>
```

**C'est tout !** Le service Twitch est maintenant disponible dans le wizard.

Pour un guide complet, voir [IMPLEMENTATION_GUIDE_AREAS.md](IMPLEMENTATION_GUIDE_AREAS.md).

---

## Utiliser le Design System

### Classes Glassmorphiques (Standard)

```html
<!-- Card standard -->
<div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
  Contenu
</div>

<!-- Bouton primary -->
<button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl">
  Créer
</button>

<!-- Input -->
<input class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white" />
```

### Couleurs

```html
<!-- Texte -->
<h1 class="text-white">Titre</h1>
<p class="text-white/70">Description</p>

<!-- Backgrounds -->
<div class="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">

<!-- Status badges -->
<span class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">Active</span>
<span class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full">Error</span>
```

Voir [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) pour la palette complète.

---

## Commandes Utiles

### Développement

```bash
npm run dev          # Serveur de dev (hot reload)
npm run build        # Build de production
npm run preview      # Prévisualiser le build
```

### Linting & Formatting

```bash
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger automatiquement
```

### Tests (si configurés)

```bash
npm run test         # Lancer les tests
npm run test:watch   # Mode watch
```

---

## Raccourcis VSCode

Installez les extensions recommandées :

1. **Vue Language Features (Volar)** - Support Vue 3
2. **TypeScript Vue Plugin (Volar)** - Support TypeScript
3. **Tailwind CSS IntelliSense** - Autocomplétion Tailwind
4. **ESLint** - Linting

### Snippets Utiles

**Créer un composant Vue** :

Tapez `vbase` puis Tab :

```vue
<script setup lang="ts">
//
</script>

<template>
  <div></div>
</template>
```

**Créer une ref** :

Tapez `vref` puis Tab :

```typescript
const name = ref('')
```

---

## Troubleshooting Rapide

### Problème : Port 3000 déjà utilisé

```bash
# Utiliser un autre port
npm run dev -- --port 3001
```

### Problème : Module non trouvé

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Problème : Erreur de build

```bash
# Nettoyer le cache Nuxt
rm -rf .nuxt
npm run dev
```

### Problème : API non accessible

Vérifiez dans `.env` :

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Assurez-vous que le backend tourne sur le port 8080.

### Problème : Tailwind ne fonctionne pas

Vérifiez que `main.css` est bien importé :

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
});
```

---

## Prochaines Étapes

Maintenant que vous avez démarré :

1. **Explorez le code** :
   - Regardez `/pages/areas/create.vue` (wizard de création)
   - Étudiez `/components/AREA/SpotifyActionConfig.vue` (exemple de config)
   - Lisez `/composables/useApi.ts` (client API)

2. **Lisez la documentation** :
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture complète
   - [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Charte graphique
   - [IMPLEMENTATION_GUIDE_AREAS.md](IMPLEMENTATION_GUIDE_AREAS.md) - Guide d'ajout de services

3. **Créez votre première feature** :
   - Ajoutez un nouveau service (suivez le guide)
   - Créez une nouvelle page
   - Développez un nouveau composant

---

## Ressources

### Documentation Officielle
- [Vue.js 3 Docs](https://vuejs.org/)
- [Nuxt 4 Docs](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Outils
- [Vue DevTools](https://devtools.vuejs.org/)
- [Tailwind Play](https://play.tailwindcss.com/) - Tester Tailwind en ligne

### Aide
- **Discord/Slack** : Contactez l'équipe
- **GitHub Issues** : Signalez les bugs
- **Documentation** : Consultez `/frontend/docs`

---

## Checklist Premier Jour

- [ ] Installation de Node.js 18+
- [ ] Clone du repository
- [ ] `npm install` dans `/frontend`
- [ ] Création du fichier `.env`
- [ ] `npm run dev` réussi
- [ ] Page d'accueil accessible sur http://localhost:3000
- [ ] Lecture de [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] Installation des extensions VSCode (Volar, Tailwind IntelliSense)
- [ ] Exploration du code dans `/pages` et `/components`
- [ ] Création d'un premier composant de test

**Félicitations ! Vous êtes prêt à développer sur le frontend AREA ! **

---

Pour toute question, consultez la documentation complète ou contactez l'équipe.
