# Documentation Frontend - AREA Platform

Bienvenue dans la documentation complète du frontend de la plateforme AREA (Relay) !

##  Table des Matières

### 1. [Architecture Frontend](ARCHITECTURE.md)
**Documentation technique complète de l'architecture**

Contenu :
- Vue d'ensemble de l'architecture (Web + Mobile)
- Stack technique (Nuxt 4, Vue 3, Flutter)
- Structure détaillée des dossiers
- Patterns architecturaux (Composition API, Composables, etc.)
- Gestion de l'état (useState, Providers)
- Routing & Navigation
- Authentification & OAuth
- Intégration API avec intercepteurs
- Configuration de l'environnement

**À lire si :** Vous voulez comprendre comment fonctionne le frontend, la structure du code, ou contribuer au projet.

### 2. [Guide d'Implémentation des AREAs](IMPLEMENTATION_GUIDE_AREAS.md)
**Guide pas à pas pour implémenter de nouvelles AREAs**

Contenu :
- Introduction aux AREAs
- Prérequis et connaissances nécessaires
- Vue d'ensemble du processus
- Étape 1 : Définir le service dans le backend (about.json)
- Étape 2 : Créer les composants de configuration (Vue)
- Étape 3 : Intégrer dans le wizard de création
- Étape 4 : Tester l'implémentation
- Exemples complets (Twitch, Notion, Weather)
- Checklist de validation
- Troubleshooting

**À lire si :** Vous devez ajouter un nouveau service (Twitch, Notion, Slack, etc.) à la plateforme.

### 3. [Charte Graphique](DESIGN_SYSTEM.md)
**Design system complet de la plateforme**

Contenu :
- Identité visuelle et philosophie du design
- Palette de couleurs complète (primaires, accents, statuts)
- Typographie (Inter, échelles, weights)
- Composants UI (boutons, cards, inputs, modals, etc.)
- Iconographie (Heroicons, tailles, contextes)
- Espacements & grilles
- Effets visuels (shadows, blur, animations)
- Responsive design (breakpoints, mobile-first)
- Accessibilité (contraste, ARIA, daltonisme)
- Guide d'utilisation pratique

**À lire si :** Vous créez de nouveaux composants UI ou voulez garantir la cohérence visuelle.

---

##  Démarrage Rapide

### Pour les Nouveaux Développeurs

1. **Comprendre l'architecture** : Lisez [ARCHITECTURE.md](ARCHITECTURE.md) en entier
2. **Explorer le code** : Naviguez dans `/frontend/app` pour voir la structure réelle
3. **Référence design** : Consultez [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) pour les composants UI

### Pour Ajouter un Nouveau Service

1. **Backend** : Ajoutez le service dans `/about.json` (voir guide)
2. **Frontend** : Suivez [IMPLEMENTATION_GUIDE_AREAS.md](IMPLEMENTATION_GUIDE_AREAS.md) étape par étape
3. **Design** : Utilisez les composants de [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

### Pour Créer un Nouveau Composant UI

1. **Référence** : Consultez [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) pour les patterns
2. **Créer** : Créez votre composant dans `/frontend/app/components`
3. **Tester** : Testez sur mobile et desktop
4. **Valider** : Vérifiez l'accessibilité et le contraste

---

##  Structure du Projet Frontend

```
frontend/
├── app/                          # Code source Nuxt
│   ├── components/              # Composants Vue réutilisables
│   │   ├── AREA/               #  Configs des services (20+ fichiers)
│   │   ├── Areas/              # Composants liés aux AREAs
│   │   ├── Dashboard/          # Composants du dashboard
│   │   └── Services/           # Gestion des services
│   │
│   ├── composables/            #  Logique métier (useApi, useAuth)
│   ├── middleware/             # Guards de routes (auth, guest)
│   ├── pages/                  #  Pages (routing automatique)
│   │   ├── areas/
│   │   │   ├── index.vue      # Liste des AREAs
│   │   │   └── create.vue     #  Wizard de création (3 étapes)
│   │   ├── login.vue
│   │   └── dashboard.vue
│   │
│   ├── assets/css/             # Styles globaux (Tailwind + tokens)
│   ├── layouts/                # Layouts de l'application
│   └── plugins/                # Plugins Nuxt
│
├── docs/                        #  Documentation (ce dossier)
│   ├── README.md               # Ce fichier
│   ├── ARCHITECTURE.md         # Architecture technique
│   ├── IMPLEMENTATION_GUIDE_AREAS.md  # Guide d'ajout de services
│   └── DESIGN_SYSTEM.md        # Charte graphique
│
├── nuxt.config.ts              # Configuration Nuxt
├── package.json                # Dépendances npm
└── tailwind.config.ts          # Configuration Tailwind
```

---

##  Technologies Utilisées

### Web Frontend
- **Framework** : Nuxt 4 (Vue.js 3 + TypeScript)
- **Styling** : Tailwind CSS 4.1
- **UI Library** : @nuxt/ui
- **Icons** : Heroicons via @iconify
- **Build** : Vite

### Mobile Frontend
- **Framework** : Flutter (Dart)
- **UI** : Material Design
- **State** : Provider pattern
- **HTTP** : http package

---

##  Conventions de Code

### Nommage

**Composants** :
- PascalCase : `SpotifyActionConfig.vue`, `AreaCard.vue`
- Nom descriptif : Éviter les noms génériques comme `Card.vue`

**Composables** :
- camelCase avec préfixe `use` : `useApi.ts`, `useAuthreal.ts`

**Fichiers** :
- kebab-case pour les pages : `areas/create.vue`
- PascalCase pour les composants

### Structure d'un Composant Vue

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, watch, onMounted } from 'vue';

// 2. Props
const props = defineProps<{
  // ...
}>();

// 3. Emits
const emit = defineEmits<{
  // ...
}>();

// 4. Composables
const { $api } = useNuxtApp();
const route = useRoute();

// 5. État local
const data = ref<Type>([]);
const loading = ref(false);

// 6. Computed
const filtered = computed(() => {
  // ...
});

// 7. Méthodes
const loadData = async () => {
  // ...
};

// 8. Watchers
watch(() => route.query, () => {
  // ...
});

// 9. Lifecycle
onMounted(() => {
  loadData();
});
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles (si nécessaire, préférer Tailwind) */
</style>
```

### Tailwind CSS

**Bonnes pratiques** :
- Utiliser les classes utilitaires plutôt que du CSS custom
- Respecter le design system (voir [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md))
- Préfixer les classes custom avec `relay-`

```html
<!--  Bon -->
<div class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">

<!--  Mauvais -->
<div style="padding: 24px; background: rgba(255,255,255,0.1);">
```

---

## 🧪 Tests

### Tests Unitaires (à venir)

```bash
# Lancer les tests
npm run test

# Tests avec coverage
npm run test:coverage
```

### Tests E2E (à venir)

```bash
# Lancer Cypress
npm run test:e2e
```

---

##  Debugging

### Activer les logs

```typescript
// Dans nuxt.config.ts
export default defineNuxtConfig({
  debug: true,
  devtools: { enabled: true },
});
```

### Vue Devtools

Installer l'extension Chrome/Firefox : [Vue Devtools](https://devtools.vuejs.org/)

### Network Debugging

```typescript
// composables/useApi.ts
onResponse({ response }) {
  if (process.dev) {
    console.log('[API]', response.url, response.status, response._data);
  }
}
```

---

## 🔗 Liens Utiles

### Documentation Officielle
- [Vue.js 3](https://vuejs.org/)
- [Nuxt 4](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
- [Flutter](https://flutter.dev/)

### Outils
- [Vue Devtools](https://devtools.vuejs.org/)
- [Tailwind Play](https://play.tailwindcss.com/)
- [Figma](https://figma.com/) (design mockups)

---

##  Contribuer

### Workflow Git

1. Créer une branche depuis `main` :
   ```bash
   git checkout -b feature/add-twitch-service
   ```

2. Développer et commiter :
   ```bash
   git add .
   git commit -m "feat: add Twitch service integration"
   ```

3. Pousser et créer une PR :
   ```bash
   git push origin feature/add-twitch-service
   ```

### Convention de Commits

Suivre [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatting, CSS
- `refactor:` - Refactoring
- `test:` - Ajout de tests
- `chore:` - Maintenance

**Exemples** :
```
feat: add Twitch service with 3 actions and 2 reactions
fix: resolve OAuth callback redirect issue
docs: update AREA implementation guide with Notion example
style: apply design system to ServiceCard component
```

### Checklist avant PR

- [ ] Le code compile sans erreur
- [ ] Les tests passent (si applicable)
- [ ] Le design respecte la charte graphique
- [ ] L'accessibilité est respectée
- [ ] Le responsive fonctionne
- [ ] La documentation est à jour
- [ ] Les commentaires sont clairs
- [ ] Pas de `console.log` oublié

---

##  Support

### Questions ?

1. **Documentation** : Cherchez dans ces 3 fichiers de doc
2. **Code existant** : Regardez les exemples (Spotify, Discord, GitHub)
3. **Équipe** : Contactez l'équipe sur Discord/Slack

### Problèmes Fréquents

**Le composant ne s'affiche pas** :
→ Vérifiez l'import et le mapping dans `create.vue`

**La configuration ne se met pas à jour** :
→ Vérifiez l'emit `update:config` et le watch

**Erreur 400 lors de la création** :
→ Vérifiez le payload (actionId doit être un number)

**Le service n'apparaît pas** :
→ Vérifiez `/about.json` et redémarrez le backend

Consultez [IMPLEMENTATION_GUIDE_AREAS.md - Troubleshooting](IMPLEMENTATION_GUIDE_AREAS.md#troubleshooting) pour plus de détails.

---

##  TODO

### Améliorations Futures

- [ ] Ajouter des tests unitaires pour tous les composants
- [ ] Implémenter des tests E2E avec Cypress
- [ ] Créer un Storybook pour les composants UI
- [ ] Améliorer la documentation mobile (Flutter)
- [ ] Ajouter plus d'exemples de services
- [ ] Créer un guide de migration vers Nuxt 4
- [ ] Documenter les best practices de performance

---

##  Licence

Ce projet est sous licence privée. Tous droits réservés.

---

**Maintenu par l'équipe AREA - Dernière mise à jour : Janvier 2025**

Pour toute question ou amélioration de cette documentation, ouvrez une issue sur GitHub.
