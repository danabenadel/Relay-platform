# Exemples Pratiques - Frontend AREA

Ce document contient des exemples de code réutilisables pour accélérer le développement.

## Table des matières

1. [Composants UI](#composants-ui)
2. [Pages](#pages)
3. [Composables](#composables)
4. [Formulaires](#formulaires)
5. [API Calls](#api-calls)
6. [Snippets Utiles](#snippets-utiles)

---

## Composants UI

### Card Glassmorphique

```vue
<!-- components/MyCard.vue -->
<script setup lang="ts">
const props = defineProps<{
  title: string;
  description?: string;
  icon?: string;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <div
    @click="emit('click')"
    class="group p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/15 hover:scale-102 transition-all duration-300 cursor-pointer"
  >
    <!-- Header with icon -->
    <div class="flex items-center gap-4 mb-4">
      <div v-if="icon" class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon :name="icon" class="w-6 h-6 text-white" />
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
        <p v-if="description" class="text-sm text-white/60">{{ description }}</p>
      </div>
    </div>

    <!-- Content slot -->
    <slot />
  </div>
</template>
```

**Utilisation** :

```vue
<MyCard
  title="Spotify Integration"
  description="Connected"
  icon="simple-icons:spotify"
  @click="handleClick"
>
  <p class="text-white/70">5 active AREAs</p>
</MyCard>
```

### Modal Réutilisable

```vue
<!-- components/Modal.vue -->
<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const close = () => {
  emit('update:modelValue', false);
};

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div :class="['w-full p-6 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl', sizeClasses[size || 'md']]">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold text-white">{{ title }}</h3>
            <button
              @click="close"
              class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5 text-white/70" />
            </button>
          </div>

          <!-- Content -->
          <div class="mb-6">
            <slot />
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <slot name="actions">
              <button
                @click="emit('cancel'); close();"
                class="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
              >
                Annuler
              </button>
              <button
                @click="emit('confirm'); close();"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Confirmer
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
```

**Utilisation** :

```vue
<script setup>
const showModal = ref(false);

const handleConfirm = () => {
  console.log('Confirmed!');
};
</script>

<template>
  <button @click="showModal = true">Ouvrir Modal</button>

  <Modal
    v-model="showModal"
    title="Supprimer l'AREA ?"
    @confirm="handleConfirm"
  >
    <p class="text-white/70">Cette action est irréversible.</p>
  </Modal>
</template>
```

### Loading Spinner

```vue
<!-- components/LoadingSpinner.vue -->
<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>();

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};
</script>

<template>
  <div
    :class="[
      'border-blue-500/30 border-t-blue-500 rounded-full animate-spin',
      sizeClasses[size || 'md']
    ]"
  ></div>
</template>
```

**Utilisation** :

```vue
<LoadingSpinner size="lg" />
```

---

## Pages

### Page Standard avec État de Loading

```vue
<!-- pages/my-page.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
});

useHead({
  title: 'Ma Page - Relay',
  meta: [
    { name: 'description', content: 'Description de ma page' }
  ],
});

const { $api } = useNuxtApp();
const toast = useToast();

// État
const data = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Filtres
const searchQuery = ref('');
const filteredData = computed(() => {
  if (!searchQuery.value) return data.value;
  return data.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Chargement des données
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    data.value = await $api('/api/endpoint');
  } catch (e) {
    error.value = 'Erreur lors du chargement';
    toast.add({
      title: 'Erreur',
      description: error.value,
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

// Actions
const handleDelete = async (id: string) => {
  if (!confirm('Êtes-vous sûr ?')) return;

  try {
    await $api(`/api/endpoint/${id}`, { method: 'DELETE' });
    toast.add({
      title: 'Succès',
      description: 'Élément supprimé',
      color: 'green',
    });
    await loadData();
  } catch (e) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer',
      color: 'red',
    });
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Ma Page</h1>
        <p class="text-white/70">Description de la page</p>
      </div>

      <!-- Barre de recherche -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher..."
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- État de loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-red-400">{{ error }}</p>
        <button
          @click="loadData"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>

      <!-- Liste vide -->
      <div v-else-if="filteredData.length === 0" class="text-center py-12">
        <p class="text-white/50">Aucun élément trouvé</p>
      </div>

      <!-- Grille de données -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredData"
          :key="item.id"
          class="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
        >
          <h3 class="text-lg font-semibold text-white mb-2">{{ item.name }}</h3>
          <p class="text-white/70 mb-4">{{ item.description }}</p>

          <button
            @click="handleDelete(item.id)"
            class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## Composables

### Composable de Gestion de Liste

```typescript
// composables/useList.ts
export const useList = <T>(endpoint: string) => {
  const { $api } = useNuxtApp();
  const toast = useToast();

  // État
  const items = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Recherche et filtres
  const searchQuery = ref('');
  const filters = ref<Record<string, any>>({});

  // Items filtrés
  const filteredItems = computed(() => {
    let result = items.value;

    // Recherche
    if (searchQuery.value) {
      result = result.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    // Filtres custom
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        result = result.filter((item: any) => item[key] === value);
      }
    });

    return result;
  });

  // Chargement
  const load = async () => {
    loading.value = true;
    error.value = null;

    try {
      items.value = await $api<T[]>(endpoint);
    } catch (e) {
      error.value = 'Erreur de chargement';
      toast.add({
        title: 'Erreur',
        description: error.value,
        color: 'red',
      });
    } finally {
      loading.value = false;
    }
  };

  // Création
  const create = async (data: Partial<T>) => {
    try {
      const newItem = await $api<T>(endpoint, {
        method: 'POST',
        body: data,
      });

      items.value.push(newItem);

      toast.add({
        title: 'Succès',
        description: 'Élément créé',
        color: 'green',
      });

      return newItem;
    } catch (e) {
      toast.add({
        title: 'Erreur',
        description: 'Impossible de créer',
        color: 'red',
      });
      throw e;
    }
  };

  // Mise à jour
  const update = async (id: string, data: Partial<T>) => {
    try {
      const updated = await $api<T>(`${endpoint}/${id}`, {
        method: 'PATCH',
        body: data,
      });

      const index = items.value.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        items.value[index] = updated;
      }

      toast.add({
        title: 'Succès',
        description: 'Élément mis à jour',
        color: 'green',
      });

      return updated;
    } catch (e) {
      toast.add({
        title: 'Erreur',
        description: 'Impossible de mettre à jour',
        color: 'red',
      });
      throw e;
    }
  };

  // Suppression
  const remove = async (id: string) => {
    try {
      await $api(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      items.value = items.value.filter((item: any) => item.id !== id);

      toast.add({
        title: 'Succès',
        description: 'Élément supprimé',
        color: 'green',
      });
    } catch (e) {
      toast.add({
        title: 'Erreur',
        description: 'Impossible de supprimer',
        color: 'red',
      });
      throw e;
    }
  };

  return {
    items,
    filteredItems,
    loading,
    error,
    searchQuery,
    filters,
    load,
    create,
    update,
    remove,
  };
};
```

**Utilisation** :

```vue
<script setup>
const {
  items,
  filteredItems,
  loading,
  searchQuery,
  load,
  remove
} = useList<Area>('/api/areas');

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="Rechercher..." />

    <div v-if="loading">Loading...</div>

    <div v-for="item in filteredItems" :key="item.id">
      {{ item.name }}
      <button @click="remove(item.id)">Supprimer</button>
    </div>
  </div>
</template>
```

---

## Formulaires

### Formulaire avec Validation

```vue
<!-- components/CreateAreaForm.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: any];
}>();

// État du formulaire
const form = ref({
  name: '',
  description: '',
  actionService: '',
  reactionService: '',
});

// Erreurs de validation
const errors = ref<Record<string, string>>({});

// Validation
const validateForm = () => {
  errors.value = {};

  if (!form.value.name) {
    errors.value.name = 'Le nom est requis';
  } else if (form.value.name.length < 3) {
    errors.value.name = 'Le nom doit contenir au moins 3 caractères';
  }

  if (!form.value.description) {
    errors.value.description = 'La description est requise';
  }

  if (!form.value.actionService) {
    errors.value.actionService = 'Veuillez sélectionner un service';
  }

  if (!form.value.reactionService) {
    errors.value.reactionService = 'Veuillez sélectionner un service';
  }

  return Object.keys(errors.value).length === 0;
};

// Computed
const isValid = computed(() => {
  return form.value.name &&
         form.value.description &&
         form.value.actionService &&
         form.value.reactionService;
});

// Soumission
const handleSubmit = () => {
  if (!validateForm()) return;

  emit('submit', form.value);
};

// Reset
const reset = () => {
  form.value = {
    name: '',
    description: '',
    actionService: '',
    reactionService: '',
  };
  errors.value = {};
};

defineExpose({ reset });
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nom -->
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Nom de l'AREA
        <span class="text-red-400">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        placeholder="Ex: Spotify → Discord"
        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.name }"
      />
      <p v-if="errors.name" class="mt-2 text-sm text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Description
        <span class="text-red-400">*</span>
      </label>
      <textarea
        v-model="form.description"
        rows="4"
        placeholder="Décrivez votre AREA..."
        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        :class="{ 'border-red-500': errors.description }"
      />
      <p v-if="errors.description" class="mt-2 text-sm text-red-400">
        {{ errors.description }}
      </p>
    </div>

    <!-- Service Action -->
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Service déclencheur
        <span class="text-red-400">*</span>
      </label>
      <select
        v-model="form.actionService"
        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.actionService }"
      >
        <option value="">Sélectionner un service</option>
        <option value="spotify">Spotify</option>
        <option value="discord">Discord</option>
        <option value="github">GitHub</option>
      </select>
      <p v-if="errors.actionService" class="mt-2 text-sm text-red-400">
        {{ errors.actionService }}
      </p>
    </div>

    <!-- Service Reaction -->
    <div>
      <label class="block text-sm font-medium text-white mb-2">
        Service de réaction
        <span class="text-red-400">*</span>
      </label>
      <select
        v-model="form.reactionService"
        class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.reactionService }"
      >
        <option value="">Sélectionner un service</option>
        <option value="spotify">Spotify</option>
        <option value="discord">Discord</option>
        <option value="openai">OpenAI</option>
      </select>
      <p v-if="errors.reactionService" class="mt-2 text-sm text-red-400">
        {{ errors.reactionService }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        type="button"
        @click="reset"
        class="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
      >
        Réinitialiser
      </button>
      <button
        type="submit"
        :disabled="!isValid"
        class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Créer l'AREA
      </button>
    </div>
  </form>
</template>
```

---

## API Calls

### Appels API avec Gestion d'Erreurs

```typescript
// Exemple dans un composant
const { $api } = useNuxtApp();
const toast = useToast();

// GET simple
const getData = async () => {
  try {
    const data = await $api('/api/endpoint');
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// POST avec body
const createItem = async (payload: any) => {
  try {
    const result = await $api('/api/endpoint', {
      method: 'POST',
      body: payload,
    });

    toast.add({
      title: 'Succès',
      description: 'Élément créé',
      color: 'green',
    });

    return result;
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.message || 'Une erreur est survenue',
      color: 'red',
    });
    throw error;
  }
};

// PATCH
const updateItem = async (id: string, updates: Partial<any>) => {
  try {
    return await $api(`/api/endpoint/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

// DELETE
const deleteItem = async (id: string) => {
  if (!confirm('Êtes-vous sûr ?')) return;

  try {
    await $api(`/api/endpoint/${id}`, {
      method: 'DELETE',
    });

    toast.add({
      title: 'Succès',
      description: 'Élément supprimé',
      color: 'green',
    });
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer',
      color: 'red',
    });
  }
};

// Appel avec loading state
const loadWithState = async () => {
  const loading = ref(true);
  const data = ref(null);
  const error = ref(null);

  try {
    data.value = await $api('/api/endpoint');
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }

  return { loading, data, error };
};
```

---

## Snippets Utiles

### Debounced Search

```vue
<script setup>
import { debounce } from 'lodash-es';

const searchQuery = ref('');
const results = ref([]);

const performSearch = async (query: string) => {
  if (!query) {
    results.value = [];
    return;
  }

  const { $api } = useNuxtApp();
  results.value = await $api(`/api/search?q=${query}`);
};

const debouncedSearch = debounce(performSearch, 300);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});
</script>

<template>
  <input v-model="searchQuery" placeholder="Rechercher..." />

  <div v-for="result in results" :key="result.id">
    {{ result.name }}
  </div>
</template>
```

### Infinite Scroll

```vue
<script setup>
const { $api } = useNuxtApp();

const items = ref<any[]>([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

const loadMore = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;

  try {
    const newItems = await $api(`/api/items?page=${page.value}&limit=20`);

    if (newItems.length === 0) {
      hasMore.value = false;
    } else {
      items.value.push(...newItems);
      page.value++;
    }
  } finally {
    loading.value = false;
  }
};

// Détection du scroll
const handleScroll = () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMore();
  }
};

onMounted(() => {
  loadMore();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div>
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>

    <div v-if="loading" class="flex justify-center py-4">
      <LoadingSpinner />
    </div>

    <div v-if="!hasMore" class="text-center py-4 text-white/50">
      Fin de la liste
    </div>
  </div>
</template>
```

### Copy to Clipboard

```vue
<script setup>
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);

    const toast = useToast();
    toast.add({
      title: 'Copié !',
      description: 'Texte copié dans le presse-papier',
      color: 'green',
    });
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};
</script>

<template>
  <button @click="copyToClipboard('Hello World')">
    <Icon name="heroicons:clipboard" class="w-5 h-5" />
    Copier
  </button>
</template>
```

### Download File

```typescript
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

// Utilisation
downloadFile('/api/export/areas', 'areas-export.json');
```

### Format Date

```typescript
const formatDate = (date: string | Date, format: 'short' | 'long' = 'short') => {
  const d = new Date(date);

  if (format === 'short') {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Usage
formatDate('2025-01-15'); // "15/01/2025"
formatDate('2025-01-15', 'long'); // "mercredi 15 janvier 2025 à 00:00"
```

### Truncate Text

```typescript
const truncate = (text: string, length: number = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Usage
truncate('This is a very long text that needs to be truncated', 20);
// "This is a very long..."
```

---

## Conclusion

Ces exemples couvrent les cas d'usage les plus fréquents dans le développement frontend de la plateforme AREA.

**Pour aller plus loin** :
- Consultez [ARCHITECTURE.md](ARCHITECTURE.md) pour comprendre l'architecture
- Référez-vous à [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) pour les composants UI
- Suivez [IMPLEMENTATION_GUIDE_AREAS.md](IMPLEMENTATION_GUIDE_AREAS.md) pour ajouter des services

**Besoin d'aide ?** Contactez l'équipe sur Discord/Slack !
