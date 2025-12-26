# Guide d'Implémentation des Nouvelles AREAs

## Table des matières

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Vue d'ensemble du processus](#vue-densemble-du-processus)
4. [Étape 1 : Définir le service dans le backend](#étape-1--définir-le-service-dans-le-backend)
5. [Étape 2 : Créer les composants de configuration](#étape-2--créer-les-composants-de-configuration)
6. [Étape 3 : Intégrer dans le wizard de création](#étape-3--intégrer-dans-le-wizard-de-création)
7. [Étape 4 : Tester l'implémentation](#étape-4--tester-limplémentation)
8. [Exemples complets](#exemples-complets)
9. [Checklist de validation](#checklist-de-validation)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

Ce guide vous accompagne pas à pas dans l'implémentation d'une nouvelle AREA dans la plateforme Relay. Une AREA est composée de :

- **Action (Trigger)** : L'événement qui déclenche l'automatisation
- **Reaction** : L'action qui est exécutée en réponse

### Exemples d'AREAs

| Action (Trigger) | Reaction (Response) |
|-----------------|---------------------|
| Nouvelle chanson ajoutée à une playlist Spotify | Envoyer un message Discord |
| Nouveau commit sur GitHub | Créer une issue GitLab |
| Nouvelle vidéo YouTube | Poster sur Reddit |
| Timer à 9h00 | Envoyer un email de résumé quotidien |

---

## Prérequis

### Connaissances requises

- Vue.js 3 avec Composition API
- TypeScript de base
- Structure du projet (voir [ARCHITECTURE.md](ARCHITECTURE.md))

### Outils nécessaires

- Node.js 18+ et npm/pnpm
- Éditeur de code (VSCode recommandé)
- Accès au backend (pour tester l'intégration complète)

### Fichiers à connaître

```
frontend/
├── app/
│   ├── components/AREA/          #  Vos nouveaux composants ici
│   │   ├── {Service}ActionConfig.vue
│   │   └── {Service}ReactionConfig.vue
│   │
│   └── pages/areas/create.vue    #  Wizard de création (à modifier)
│
└── docs/
    └── IMPLEMENTATION_GUIDE_AREAS.md  # Ce fichier
```

---

## Vue d'ensemble du processus

```
┌──────────────────────────────────────────────────────────┐
│                  Processus d'ajout d'une AREA            │
└──────────────────────────────────────────────────────────┘

1. Backend
   ├── Ajouter le service dans /about.json
   ├── Définir les actions disponibles
   ├── Définir les réactions disponibles
   └── Implémenter la logique métier (microservice)

2. Frontend
   ├── Créer {Service}ActionConfig.vue
   ├── Créer {Service}ReactionConfig.vue
   ├── Importer dans pages/areas/create.vue
   └── Ajouter aux composants dynamiques

3. Tests
   ├── Tester chaque type d'action
   ├── Tester chaque type de réaction
   ├── Valider la création end-to-end
   └── Vérifier l'exécution de l'AREA
```

---

## Étape 1 : Définir le service dans le backend

### 1.1 Structure du fichier about.json

Le fichier `/about.json` (backend) définit tous les services disponibles :

```json
{
  "server": {
    "current_time": 1234567890,
    "services": [
      {
        "name": "spotify",
        "actions": [
          {
            "name": "new_track_in_playlist",
            "description": "Se déclenche quand une chanson est ajoutée à une playlist"
          },
          {
            "name": "new_saved_track",
            "description": "Se déclenche quand vous aimez une chanson"
          }
        ],
        "reactions": [
          {
            "name": "play_track",
            "description": "Lire une chanson spécifique"
          },
          {
            "name": "add_to_playlist",
            "description": "Ajouter une chanson à une playlist"
          }
        ]
      }
    ]
  }
}
```

### 1.2 Exemple : Ajouter le service Twitch

```json
{
  "name": "twitch",
  "actions": [
    {
      "name": "stream_started",
      "description": "Se déclenche quand un streamer démarre un live"
    },
    {
      "name": "new_follower",
      "description": "Se déclenche quand quelqu'un vous follow"
    },
    {
      "name": "channel_subscribed",
      "description": "Se déclenche lors d'un nouvel abonnement"
    }
  ],
  "reactions": [
    {
      "name": "send_chat_message",
      "description": "Envoyer un message dans le chat"
    },
    {
      "name": "create_clip",
      "description": "Créer un clip de la dernière minute"
    },
    {
      "name": "start_commercial",
      "description": "Lancer une publicité"
    }
  ]
}
```

### 1.3 Configuration requise pour chaque action/réaction

Notez les **paramètres de configuration** nécessaires pour chaque action/réaction :

| Action/Reaction | Paramètres requis | Type |
|----------------|-------------------|------|
| `stream_started` | `channelName` | string |
| `new_follower` | Aucun | - |
| `send_chat_message` | `channelName`, `message` | string, string |
| `create_clip` | `duration` | number (secondes) |

---

## Étape 2 : Créer les composants de configuration

### 2.1 Créer TwitchActionConfig.vue

**Chemin** : `frontend/app/components/AREA/TwitchActionConfig.vue`

```vue
<script setup lang="ts">
/**
 * Composant de configuration des actions Twitch
 * Permet de configurer les triggers pour le service Twitch
 */

// Props reçues du parent (wizard)
const props = defineProps<{
  actionType: string;           // Type d'action sélectionné (ex: "stream_started")
  config: Record<string, any>;  // Configuration actuelle
}>();

// Emit pour notifier les changements au parent
const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

// Configuration locale (copie de props.config)
const localConfig = ref<Record<string, any>>({ ...props.config });

// Synchroniser les changements externes (si le parent modifie config)
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

// Émettre les changements au parent
const updateConfig = () => {
  emit('update:config', localConfig.value);
};

// Validation
const isChannelNameValid = computed(() => {
  return localConfig.value.channelName &&
         localConfig.value.channelName.length > 0;
});
</script>

<template>
  <div class="space-y-6">
    <!-- stream_started -->
    <div v-if="actionType === 'stream_started'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Nom du channel
        </label>
        <input
          v-model="localConfig.channelName"
          @input="updateConfig"
          type="text"
          placeholder="Ex: zerator"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
        <p class="mt-2 text-sm text-white/60">
          Le nom du channel Twitch à surveiller (sans le @)
        </p>
      </div>
    </div>

    <!-- new_follower -->
    <div v-else-if="actionType === 'new_follower'">
      <div class="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <p class="text-white/70">
          Cette action se déclenche automatiquement quand quelqu'un vous follow.
          Aucune configuration supplémentaire n'est nécessaire.
        </p>
      </div>
    </div>

    <!-- channel_subscribed -->
    <div v-else-if="actionType === 'channel_subscribed'">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            Filtrer par tier (optionnel)
          </label>
          <select
            v-model="localConfig.tier"
            @change="updateConfig"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tous les tiers</option>
            <option value="1000">Tier 1</option>
            <option value="2000">Tier 2</option>
            <option value="3000">Tier 3</option>
          </select>
        </div>

        <div class="flex items-start gap-3">
          <input
            v-model="localConfig.giftOnly"
            @change="updateConfig"
            type="checkbox"
            id="giftOnly"
            class="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded"
          />
          <label for="giftOnly" class="text-sm text-white/70">
            Uniquement les abonnements offerts (gifts)
          </label>
        </div>
      </div>
    </div>

    <!-- Action inconnue -->
    <div v-else>
      <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-red-400">
          Type d'action inconnu : {{ actionType }}
        </p>
      </div>
    </div>

    <!-- Afficher l'état de validation (debug) -->
    <div v-if="actionType === 'stream_started'" class="mt-4">
      <div
        v-if="!isChannelNameValid"
        class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
      >
        <p class="text-sm text-yellow-400">
           Veuillez renseigner un nom de channel
        </p>
      </div>
    </div>
  </div>
</template>
```

### 2.2 Créer TwitchReactionConfig.vue

**Chemin** : `frontend/app/components/AREA/TwitchReactionConfig.vue`

```vue
<script setup lang="ts">
/**
 * Composant de configuration des réactions Twitch
 * Permet de configurer les actions à exécuter sur Twitch
 */

const props = defineProps<{
  reactionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

const localConfig = ref<Record<string, any>>({ ...props.config });

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

const updateConfig = () => {
  emit('update:config', localConfig.value);
};

// Validation
const isSendChatMessageValid = computed(() => {
  return localConfig.value.channelName &&
         localConfig.value.message &&
         localConfig.value.message.length > 0;
});

const isCreateClipValid = computed(() => {
  return localConfig.value.duration &&
         localConfig.value.duration >= 5 &&
         localConfig.value.duration <= 60;
});
</script>

<template>
  <div class="space-y-6">
    <!-- send_chat_message -->
    <div v-if="reactionType === 'send_chat_message'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Nom du channel
        </label>
        <input
          v-model="localConfig.channelName"
          @input="updateConfig"
          type="text"
          placeholder="Ex: zerator"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message
        </label>
        <textarea
          v-model="localConfig.message"
          @input="updateConfig"
          rows="4"
          placeholder="Votre message..."
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <p class="mt-2 text-sm text-white/60">
          Variables disponibles : {username}, {game}, {title}
        </p>
      </div>

      <!-- Validation -->
      <div v-if="!isSendChatMessageValid" class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p class="text-sm text-yellow-400">
           Veuillez renseigner le channel et le message
        </p>
      </div>
    </div>

    <!-- create_clip -->
    <div v-else-if="reactionType === 'create_clip'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Durée du clip (secondes)
        </label>
        <input
          v-model.number="localConfig.duration"
          @input="updateConfig"
          type="number"
          min="5"
          max="60"
          placeholder="30"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p class="mt-2 text-sm text-white/60">
          Entre 5 et 60 secondes
        </p>
      </div>

      <div class="flex items-start gap-3">
        <input
          v-model="localConfig.hasDelay"
          @change="updateConfig"
          type="checkbox"
          id="hasDelay"
          class="mt-1 w-5 h-5 bg-white/10 border border-white/20 rounded"
        />
        <label for="hasDelay" class="text-sm text-white/70">
          Ajouter un délai de 15 secondes avant de créer le clip
        </label>
      </div>

      <!-- Validation -->
      <div v-if="!isCreateClipValid" class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p class="text-sm text-yellow-400">
           La durée doit être entre 5 et 60 secondes
        </p>
      </div>
    </div>

    <!-- start_commercial -->
    <div v-else-if="reactionType === 'start_commercial'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Durée de la publicité
        </label>
        <select
          v-model.number="localConfig.length"
          @change="updateConfig"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option :value="30">30 secondes</option>
          <option :value="60">1 minute</option>
          <option :value="90">1 minute 30</option>
          <option :value="120">2 minutes</option>
          <option :value="150">2 minutes 30</option>
          <option :value="180">3 minutes</option>
        </select>
      </div>
    </div>

    <!-- Reaction inconnue -->
    <div v-else>
      <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-red-400">
          Type de réaction inconnu : {{ reactionType }}
        </p>
      </div>
    </div>
  </div>
</template>
```

### 2.3 Bonnes pratiques pour les composants de configuration

#### Structure recommandée

```vue
<script setup lang="ts">
// 1. Props
const props = defineProps<{
  actionType: string;  // ou reactionType
  config: Record<string, any>;
}>();

// 2. Emits
const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

// 3. État local
const localConfig = ref({ ...props.config });

// 4. Watch pour synchro
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

// 5. Méthode de mise à jour
const updateConfig = () => {
  emit('update:config', localConfig.value);
};

// 6. Computed de validation
const isValid = computed(() => {
  // Logique de validation
  return true;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Condition par type -->
    <div v-if="actionType === 'type1'">
      <!-- Formulaire -->
    </div>

    <div v-else-if="actionType === 'type2'">
      <!-- Autre formulaire -->
    </div>

    <!-- Message de validation -->
    <div v-if="!isValid" class="alert">
       Message d'erreur
    </div>
  </div>
</template>
```

#### Validation

Toujours valider :
- **Champs requis** : Vérifier que les inputs ne sont pas vides
- **Format** : Emails, URLs, nombres dans une plage
- **Longueur** : Min/max pour les strings
- **Dépendances** : Si un champ dépend d'un autre

```typescript
const isConfigValid = computed(() => {
  switch (props.actionType) {
    case 'stream_started':
      return !!localConfig.value.channelName;

    case 'channel_subscribed':
      // Optionnel, toujours valide
      return true;

    default:
      return false;
  }
});
```

#### Messages utilisateur

Toujours fournir :
- **Placeholder** : Exemple de valeur attendue
- **Description** : Explication sous le champ
- **Erreur** : Message clair en cas d'erreur
- **Succès** : Feedback de validation

```vue
<input
  placeholder="Ex: zerator"
  class="..."
/>
<p class="mt-2 text-sm text-white/60">
  Le nom du channel Twitch à surveiller (sans le @)
</p>

<div v-if="!isValid" class="alert-error">
   Veuillez renseigner un nom de channel valide
</div>
```

---

## Étape 3 : Intégrer dans le wizard de création

### 3.1 Importer les composants

**Fichier** : `frontend/app/pages/areas/create.vue`

```vue
<script setup lang="ts">
// ... imports existants ...

//  Ajouter vos imports
import TwitchActionConfig from '~/components/AREA/TwitchActionConfig.vue';
import TwitchReactionConfig from '~/components/AREA/TwitchReactionConfig.vue';
</script>
```

### 3.2 Ajouter au mapping des composants d'action

Localisez la section **Step 3 : Configuration** dans `create.vue` (environ ligne 274) :

```vue
<script setup lang="ts">
// Mapping des composants d'action
const actionConfigComponents: Record<string, Component> = {
  // ... composants existants ...
  spotify: SpotifyActionConfig,
  discord: DiscordActionConfig,
  github: GitHubActionConfig,
  // ... etc ...

  //  Ajouter votre service
  twitch: TwitchActionConfig,
};
</script>
```

### 3.3 Ajouter au mapping des composants de réaction

```vue
<script setup lang="ts">
// Mapping des composants de réaction
const reactionConfigComponents: Record<string, Component> = {
  // ... composants existants ...
  spotify: SpotifyReactionConfig,
  discord: DiscordReactionConfig,
  openai: OpenAIReactionConfig,
  // ... etc ...

  //  Ajouter votre service
  twitch: TwitchReactionConfig,
};
</script>
```

### 3.4 Vérifier le rendu dynamique

Le wizard utilise `<component :is="...">` pour afficher dynamiquement le bon composant :

```vue
<template>
  <!-- Step 3: Configuration -->
  <div v-if="step === 3">
    <!-- Configuration de l'action -->
    <component
      :is="actionConfigComponents[selectedActionService]"
      v-if="actionConfigComponents[selectedActionService]"
      :action-type="selectedAction?.name"
      :config="actionConfig"
      @update:config="actionConfig = $event"
    />

    <!-- Configuration de la réaction -->
    <component
      :is="reactionConfigComponents[selectedReactionService]"
      v-if="reactionConfigComponents[selectedReactionService]"
      :reaction-type="selectedReaction?.name"
      :config="reactionConfig"
      @update:config="reactionConfig = $event"
    />
  </div>
</template>
```

**Aucune modification n'est nécessaire ici**, tant que vos composants suivent le pattern standard.

### 3.5 Valider la configuration avant soumission

Localisez la fonction `createArea()` (ligne ~540) et assurez-vous que la validation est bien implémentée :

```typescript
const createArea = async () => {
  // Validation
  if (!areaName.value || !areaDescription.value) {
    toast.add({
      title: 'Erreur',
      description: 'Veuillez remplir tous les champs requis',
      color: 'red',
    });
    return;
  }

  //  Validation spécifique à Twitch (exemple)
  if (selectedActionService.value === 'twitch') {
    if (selectedAction.value?.name === 'stream_started') {
      if (!actionConfig.value.channelName) {
        toast.add({
          title: 'Configuration invalide',
          description: 'Le nom du channel est requis',
          color: 'red',
        });
        return;
      }
    }
  }

  // Créer l'AREA
  const { $api } = useNuxtApp();
  const newArea = await $api('/api/areas', {
    method: 'POST',
    body: {
      name: areaName.value,
      description: areaDescription.value,
      actionId: selectedAction.value?.id,
      reactionId: selectedReaction.value?.id,
      config: {
        action: actionConfig.value,
        reaction: reactionConfig.value,
      },
      isActive: true,
    },
  });

  toast.add({
    title: 'AREA créée !',
    description: `${areaName.value} a été créée avec succès`,
    color: 'green',
  });

  await navigateTo('/areas');
};
```

---

## Étape 4 : Tester l'implémentation

### 4.1 Tests unitaires des composants

Créez un fichier de test pour chaque composant :

**Fichier** : `frontend/app/components/AREA/__tests__/TwitchActionConfig.spec.ts`

```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import TwitchActionConfig from '../TwitchActionConfig.vue';

describe('TwitchActionConfig', () => {
  it('should render stream_started configuration', () => {
    const wrapper = mount(TwitchActionConfig, {
      props: {
        actionType: 'stream_started',
        config: {},
      },
    });

    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Nom du channel');
  });

  it('should emit update:config when channelName changes', async () => {
    const wrapper = mount(TwitchActionConfig, {
      props: {
        actionType: 'stream_started',
        config: {},
      },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue('zerator');

    expect(wrapper.emitted('update:config')).toBeTruthy();
    expect(wrapper.emitted('update:config')?.[0][0]).toEqual({
      channelName: 'zerator',
    });
  });

  it('should show info message for new_follower', () => {
    const wrapper = mount(TwitchActionConfig, {
      props: {
        actionType: 'new_follower',
        config: {},
      },
    });

    expect(wrapper.text()).toContain('Aucune configuration supplémentaire');
  });
});
```

### 4.2 Tests d'intégration

Testez le flux complet de création :

```typescript
describe('AREA Creation Flow with Twitch', () => {
  it('should create a Twitch AREA successfully', async () => {
    const wrapper = mount(CreateAreaPage);

    // Step 1: Sélectionner l'action
    await wrapper.find('[data-service="twitch"]').trigger('click');
    await wrapper.find('[data-action="stream_started"]').trigger('click');

    // Step 2: Sélectionner la réaction
    await wrapper.find('[data-service="discord"]').trigger('click');
    await wrapper.find('[data-reaction="send_message"]').trigger('click');

    // Step 3: Configuration
    await wrapper.find('input[placeholder*="channel"]').setValue('zerator');
    await wrapper.find('input[name="areaName"]').setValue('Stream Alert');
    await wrapper.find('textarea[name="areaDescription"]').setValue('Alert Discord when Zerator goes live');

    // Submit
    await wrapper.find('button[type="submit"]').trigger('click');

    // Vérifier l'appel API
    expect(mockApi).toHaveBeenCalledWith('/api/areas', {
      method: 'POST',
      body: expect.objectContaining({
        name: 'Stream Alert',
        config: {
          action: { channelName: 'zerator' },
          reaction: expect.any(Object),
        },
      }),
    });
  });
});
```

### 4.3 Tests manuels

#### Checklist de test manuel

- [ ] Le service Twitch apparaît dans la liste des services (Step 1)
- [ ] Les 3 actions Twitch sont affichées
- [ ] Sélectionner `stream_started` affiche le formulaire de configuration
- [ ] Remplir `channelName` met à jour la configuration
- [ ] Sélectionner une réaction Twitch fonctionne
- [ ] Créer l'AREA envoie les bonnes données au backend
- [ ] L'AREA apparaît dans `/areas` après création
- [ ] Activer/désactiver l'AREA fonctionne
- [ ] Exécuter manuellement l'AREA fonctionne

#### Test de bout en bout

1. **Démarrer le frontend** :
   ```bash
   cd frontend
   npm run dev
   ```

2. **Naviguer vers** : http://localhost:3000/areas/create

3. **Créer une AREA Twitch → Discord** :
   - Step 1 : Twitch → `stream_started`
   - Step 2 : Discord → `send_message`
   - Step 3 : Configurer les deux
   - Valider la création

4. **Vérifier dans** : http://localhost:3000/areas
   - L'AREA doit apparaître
   - Le statut doit être "Active"
   - Les services doivent être affichés correctement

5. **Tester l'exécution** :
   - Cliquer sur "Exécuter"
   - Vérifier les logs du backend
   - Vérifier que le message Discord est bien envoyé

---

## Exemples complets

### Exemple 1 : Service simple sans configuration

**Service LinkedIn (Action uniquement)**

```json
// about.json
{
  "name": "linkedin",
  "actions": [
    {
      "name": "new_connection",
      "description": "Se déclenche quand quelqu'un se connecte à vous"
    }
  ],
  "reactions": []
}
```

```vue
<!-- components/AREA/LinkedInActionConfig.vue -->
<script setup lang="ts">
const props = defineProps<{
  actionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

const localConfig = ref({ ...props.config });
</script>

<template>
  <div>
    <div v-if="actionType === 'new_connection'" class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
      <p class="text-white/70">
        Cette action se déclenche automatiquement.
        Aucune configuration n'est requise.
      </p>
    </div>
  </div>
</template>
```

### Exemple 2 : Service avec configuration complexe

**Service Notion (Reaction)**

```json
// about.json
{
  "name": "notion",
  "actions": [],
  "reactions": [
    {
      "name": "create_page",
      "description": "Créer une nouvelle page dans une base de données"
    }
  ]
}
```

```vue
<!-- components/AREA/NotionReactionConfig.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  reactionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

const localConfig = ref({
  databaseId: '',
  title: '',
  properties: {},
  ...props.config,
});

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

const updateConfig = () => {
  emit('update:config', localConfig.value);
};

// Liste des bases de données (à charger depuis l'API Notion)
const databases = ref([
  { id: 'db1', name: 'Tasks' },
  { id: 'db2', name: 'Notes' },
]);

const selectedDatabase = computed(() => {
  return databases.value.find(db => db.id === localConfig.value.databaseId);
});

const isValid = computed(() => {
  return localConfig.value.databaseId && localConfig.value.title;
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="reactionType === 'create_page'">
      <!-- Sélection de la base de données -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Base de données
        </label>
        <select
          v-model="localConfig.databaseId"
          @change="updateConfig"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
        >
          <option value="">Sélectionner une base de données</option>
          <option
            v-for="db in databases"
            :key="db.id"
            :value="db.id"
          >
            {{ db.name }}
          </option>
        </select>
      </div>

      <!-- Titre de la page -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Titre de la page
        </label>
        <input
          v-model="localConfig.title"
          @input="updateConfig"
          type="text"
          placeholder="Ex: Nouvelle tâche"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
        />
        <p class="mt-2 text-sm text-white/60">
          Variables : {trigger_name}, {timestamp}, {username}
        </p>
      </div>

      <!-- Propriétés personnalisées -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Propriétés (JSON)
        </label>
        <textarea
          v-model="localConfig.properties"
          @input="updateConfig"
          rows="6"
          placeholder='{"Status": "To Do", "Priority": "High"}'
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-mono text-sm"
        />
      </div>

      <!-- Validation -->
      <div v-if="!isValid" class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p class="text-sm text-yellow-400">
           Veuillez sélectionner une base de données et renseigner un titre
        </p>
      </div>
    </div>
  </div>
</template>
```

### Exemple 3 : Service avec variables dynamiques

**Service Weather (Action avec autocomplete)**

```vue
<!-- components/AREA/WeatherActionConfig.vue -->
<script setup lang="ts">
const props = defineProps<{
  actionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  'update:config': [config: Record<string, any>];
}>();

const localConfig = ref({
  city: '',
  condition: 'rain',
  temperature: null,
  ...props.config,
});

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });

const updateConfig = () => {
  emit('update:config', localConfig.value);
};

// Autocomplete des villes
const citySearch = ref('');
const cities = ref<string[]>([]);

const searchCities = async (query: string) => {
  if (query.length < 2) return;

  const { $api } = useNuxtApp();
  cities.value = await $api(`/api/weather/cities?q=${query}`);
};

watch(citySearch, (newQuery) => {
  searchCities(newQuery);
});

const selectCity = (city: string) => {
  localConfig.value.city = city;
  citySearch.value = city;
  cities.value = [];
  updateConfig();
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="actionType === 'weather_condition'">
      <!-- Ville avec autocomplete -->
      <div class="relative">
        <label class="block text-sm font-medium text-white mb-2">
          Ville
        </label>
        <input
          v-model="citySearch"
          @input="searchCities($event.target.value)"
          type="text"
          placeholder="Rechercher une ville..."
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
        />

        <!-- Liste d'autocomplete -->
        <div
          v-if="cities.length > 0"
          class="absolute z-10 w-full mt-2 bg-slate-800 border border-white/20 rounded-xl overflow-hidden"
        >
          <button
            v-for="city in cities"
            :key="city"
            @click="selectCity(city)"
            class="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors"
          >
            {{ city }}
          </button>
        </div>
      </div>

      <!-- Condition météo -->
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Condition
        </label>
        <select
          v-model="localConfig.condition"
          @change="updateConfig"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
        >
          <option value="rain">Pluie</option>
          <option value="snow">Neige</option>
          <option value="sun">Soleil</option>
          <option value="clouds">Nuageux</option>
          <option value="storm">Orage</option>
        </select>
      </div>

      <!-- Température seuil (optionnel) -->
      <div class="flex items-start gap-3">
        <input
          v-model="localConfig.useTemperature"
          @change="updateConfig"
          type="checkbox"
          id="useTemp"
          class="mt-1 w-5 h-5"
        />
        <div class="flex-1">
          <label for="useTemp" class="text-sm text-white/70">
            Déclencher uniquement si température > seuil
          </label>

          <input
            v-if="localConfig.useTemperature"
            v-model.number="localConfig.temperature"
            @input="updateConfig"
            type="number"
            placeholder="Ex: 25"
            class="mt-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
          />
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## Checklist de validation

Avant de considérer votre implémentation comme terminée, vérifiez :

### Backend

- [ ] Le service est défini dans `/about.json`
- [ ] Toutes les actions sont listées avec descriptions
- [ ] Toutes les réactions sont listées avec descriptions
- [ ] Le microservice backend est implémenté
- [ ] Les endpoints API sont fonctionnels
- [ ] La logique de déclenchement fonctionne

### Frontend - Composants

- [ ] `{Service}ActionConfig.vue` est créé
- [ ] `{Service}ReactionConfig.vue` est créé
- [ ] Tous les types d'actions ont un formulaire
- [ ] Tous les types de réactions ont un formulaire
- [ ] La validation fonctionne correctement
- [ ] Les messages d'erreur sont clairs
- [ ] Les placeholders et descriptions sont présents

### Frontend - Intégration

- [ ] Les composants sont importés dans `create.vue`
- [ ] Le service est ajouté à `actionConfigComponents`
- [ ] Le service est ajouté à `reactionConfigComponents`
- [ ] Le wizard affiche bien les étapes
- [ ] La navigation entre les étapes fonctionne
- [ ] La configuration est bien passée aux composants
- [ ] Les changements sont bien propagés au parent

### Tests

- [ ] Tests unitaires des composants passent
- [ ] Tests d'intégration passent
- [ ] Test manuel de bout en bout réussi
- [ ] L'AREA se crée correctement
- [ ] L'AREA s'affiche dans la liste
- [ ] L'AREA peut être activée/désactivée
- [ ] L'AREA peut être exécutée manuellement
- [ ] L'AREA peut être supprimée

### UX

- [ ] Le design est cohérent avec les autres services
- [ ] Les classes Tailwind respectent le design system
- [ ] Les transitions sont fluides
- [ ] Les messages de feedback sont présents
- [ ] L'accessibilité est respectée (labels, aria, etc.)
- [ ] Le responsive fonctionne (mobile)

### Documentation

- [ ] Les composants ont des commentaires JSDoc
- [ ] Les props sont documentées
- [ ] Les emits sont documentés
- [ ] Un exemple d'utilisation est fourni
- [ ] Le README est mis à jour (si applicable)

---

## Troubleshooting

### Problème : Le composant ne s'affiche pas

**Symptôme** : Aucun formulaire de configuration n'apparaît à l'étape 3.

**Solutions** :

1. Vérifier l'import dans `create.vue` :
   ```vue
   <script setup>
   import TwitchActionConfig from '~/components/AREA/TwitchActionConfig.vue';
   </script>
   ```

2. Vérifier le mapping :
   ```typescript
   const actionConfigComponents = {
     twitch: TwitchActionConfig, // Bien présent ?
   };
   ```

3. Vérifier le nom du service :
   ```typescript
   // Le nom doit matcher exactement celui de about.json
   selectedActionService.value === 'twitch' // Minuscules !
   ```

4. Console du navigateur : Vérifier les erreurs
   ```
   F12 > Console > Chercher les erreurs de compilation
   ```

### Problème : La configuration ne se met pas à jour

**Symptôme** : Modifier un champ ne change pas `actionConfig` ou `reactionConfig`.

**Solutions** :

1. Vérifier l'emit :
   ```vue
   <script setup>
   const updateConfig = () => {
     emit('update:config', localConfig.value); // 
   };
   </script>
   ```

2. Vérifier le nom de l'event :
   ```typescript
   // Doit être exactement 'update:config'
   const emit = defineEmits<{
     'update:config': [config: Record<string, any>];
   }>();
   ```

3. Vérifier l'appel de `updateConfig()` :
   ```vue
   <input
     v-model="localConfig.channelName"
     @input="updateConfig" <!--  -->
   />
   ```

4. Vérifier le watch :
   ```typescript
   watch(() => props.config, (newConfig) => {
     localConfig.value = { ...newConfig }; //  Copie profonde
   }, { deep: true }); //  Important !
   ```

### Problème : Erreur 400 lors de la création

**Symptôme** : L'API renvoie une erreur 400 "Bad Request".

**Solutions** :

1. Vérifier le payload envoyé :
   ```typescript
   // Ouvrir la console > Network > Payload
   {
     "name": "...",
     "description": "...",
     "actionId": 123, //  Doit être un nombre
     "reactionId": 456,
     "config": {
       "action": { ... }, //  Pas vide
       "reaction": { ... }
     },
     "isActive": true
   }
   ```

2. Vérifier que `actionId` et `reactionId` sont bien des nombres :
   ```typescript
   const selectedAction = computed(() => {
     return actions.value.find(a => a.name === selectedActionName.value);
   });

   // selectedAction.value?.id doit être un number, pas un string
   ```

3. Vérifier la structure de `config` :
   ```typescript
   //  Mauvais
   config: actionConfig.value

   //  Bon
   config: {
     action: actionConfig.value,
     reaction: reactionConfig.value,
   }
   ```

### Problème : Le service n'apparaît pas dans la liste

**Symptôme** : Impossible de sélectionner le service à l'étape 1.

**Solutions** :

1. Vérifier `/about.json` :
   ```json
   {
     "server": {
       "services": [
         {
           "name": "twitch", //  Bien présent
           "actions": [...],
           "reactions": [...]
         }
       ]
     }
   }
   ```

2. Redémarrer le backend :
   ```bash
   # about.json est lu au démarrage
   docker-compose restart
   ```

3. Vérifier l'appel API :
   ```typescript
   const { getAbout } = useApi();
   const about = await getAbout();
   console.log(about.server.services); // Twitch présent ?
   ```

### Problème : Erreur TypeScript

**Symptôme** : `Property 'xxx' does not exist on type 'yyy'`

**Solutions** :

1. Typer correctement les props :
   ```typescript
   //  Mauvais
   const props = defineProps({
     config: Object
   });

   //  Bon
   const props = defineProps<{
     config: Record<string, any>;
   }>();
   ```

2. Typer les refs :
   ```typescript
   //  Mauvais
   const localConfig = ref({});

   //  Bon
   const localConfig = ref<Record<string, any>>({});
   ```

3. Utiliser des types personnalisés :
   ```typescript
   interface TwitchActionConfig {
     channelName?: string;
     tier?: string;
     giftOnly?: boolean;
   }

   const localConfig = ref<TwitchActionConfig>({});
   ```

---

## Ressources

### Documentation officielle

- [Vue.js 3](https://vuejs.org/)
- [Nuxt 4](https://nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@nuxt/ui](https://ui.nuxt.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Fichiers de référence

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture frontend complète
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Charte graphique
- `app/pages/areas/create.vue` - Wizard de création
- `app/components/AREA/SpotifyActionConfig.vue` - Exemple d'implémentation

### Exemples de services déjà implémentés

| Service | Fichiers |
|---------|----------|
| Spotify | `SpotifyActionConfig.vue`, `SpotifyReactionConfig.vue` |
| Discord | `DiscordActionConfig.vue`, `DiscordReactionConfig.vue` |
| GitHub | `GitHubActionConfig.vue`, `GitHubReactionConfig.vue` |
| OpenAI | `OpenAIReactionConfig.vue` |
| Timer | `TimerActionConfig.vue` |

---

## Conclusion

Vous disposez maintenant d'un guide complet pour implémenter de nouvelles AREAs dans la plateforme Relay !

### Résumé du processus

1. **Backend** : Définir le service dans `/about.json`
2. **Composants** : Créer `{Service}ActionConfig.vue` et `{Service}ReactionConfig.vue`
3. **Intégration** : Ajouter dans `create.vue`
4. **Tests** : Valider avec des tests unitaires et manuels

### Prochaines étapes

- Implémenter votre premier service en suivant ce guide
- Améliorer les composants existants
- Ajouter des tests automatisés
- Contribuer à la documentation

**Bon développement ! **
