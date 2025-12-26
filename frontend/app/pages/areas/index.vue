<!-- pages/areas/index.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <!-- Skip Links -->
    <SkipLinks />

    <!-- Navigation -->
    <nav role="navigation" aria-label="Navigation principale" class="bg-white/10 backdrop-blur-xl border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" aria-label="Retour à l'accueil Relay" class="flex items-center space-x-3 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded">
            <span class="text-2xl font-bold text-white">Relay</span>
          </NuxtLink>
          <div class="flex space-x-2 items-center">
            <ColorblindSelector />
            <NuxtLink
              to="/dashboard"
              aria-label="Aller au tableau de bord"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:view-dashboard" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/services"
              aria-label="Aller aux services"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:puzzle-piece" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Services
            </NuxtLink>
            <NuxtLink
              to="/areas"
              aria-label="AREAs (page actuelle)"
              aria-current="page"
              class="text-white px-4 py-2 rounded-lg bg-white/20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:lightning-bolt" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              AREAs
            </NuxtLink>
            <NuxtLink
              to="/profile"
              aria-label="Aller au profil"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:account" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Profil
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header role="banner" class="bg-white/5 backdrop-blur-sm border-b border-white/10 py-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Mes Automatisations</h1>
            <p class="text-blue-200 text-lg">
              Gérez et exécutez vos AREAs en un clic
            </p>
          </div>
          <NuxtLink
            to="/areas/create"
            aria-label="Créer une nouvelle automatisation"
            class="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon name="mdi:plus-circle" aria-hidden="true" class="w-5 h-5 mr-2" />
            Nouvelle AREA
          </NuxtLink>
        </div>

        <!-- Statistiques -->
        <div role="region" aria-label="Statistiques des automatisations" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <div class="text-2xl font-bold text-white">{{ areas.length }}</div>
            <div class="text-sm text-blue-200">Total AREAs</div>
          </div>
          <div class="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <div class="text-2xl font-bold text-white">{{ activeAreasCount }}</div>
            <div class="text-sm text-green-200">Actives</div>
          </div>
          <div class="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <div class="text-2xl font-bold text-white">{{ inactiveAreasCount }}</div>
            <div class="text-sm text-purple-200">Inactives</div>
          </div>
          <div class="bg-gradient-to-br from-orange-600/20 to-orange-700/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
            <div class="text-2xl font-bold text-white">{{ usedServicesCount }}</div>
            <div class="text-sm text-orange-200">Services utilisés</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main id="main-content" role="main" class="max-w-7xl mx-auto px-4 py-8">
      <!-- Barre de recherche et filtres -->
      <div role="search" aria-label="Filtres de recherche" class="mb-6 flex flex-col md:flex-row gap-3">
        <!-- Recherche -->
        <div class="relative flex-1">
          <Icon
            name="mdi:magnify"
            aria-hidden="true"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50"
          />
          <input
            v-model="searchQuery"
            type="search"
            aria-label="Rechercher une automatisation par nom, description ou service"
            placeholder="Rechercher une AREA..."
            class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Filtre statut -->
        <select
          v-model="activeFilter"
          aria-label="Filtrer par statut"
          class="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes</option>
          <option value="active">Actives uniquement</option>
          <option value="inactive">Inactives uniquement</option>
        </select>

        <!-- Filtre service -->
        <select
          v-model="serviceFilter"
          aria-label="Filtrer par service"
          class="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les services</option>
          <option v-for="service in usedServices" :key="service" :value="service">
            {{ service }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" role="status" aria-live="polite" class="text-center py-20">
        <Icon name="mdi:loading" aria-hidden="true" class="animate-spin w-12 h-12 text-white/50 mx-auto mb-4" />
        <p class="text-white/70">Chargement de vos AREAs...</p>
      </div>

      <!-- Liste des AREAs -->
      <div v-else-if="filteredAreas.length > 0" role="list" aria-label="Liste des automatisations" class="space-y-4">
        <article
          v-for="area in filteredAreas"
          :key="area.id"
          role="listitem"
          class="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-blue-500/30 transition-all overflow-hidden group"
        >
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">{{ area.name }}</h3>
                  <span
                    :class="area.active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'"
                    :aria-label="area.active ? 'Statut : Active' : 'Statut : Inactive'"
                    class="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
                  >
                    <Icon :name="area.active ? 'mdi:check-circle' : 'mdi:pause-circle'" aria-hidden="true" class="w-3 h-3" />
                    {{ area.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="text-sm text-white/60">
                  {{ area.description }}
                </p>
              </div>
            </div>

            <!-- Workflow -->
            <div class="mb-6">
              <div class="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <!-- Action -->
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30" aria-hidden="true">
                    <Icon :name="getServiceIcon(area.actionService)" aria-hidden="true" class="w-7 h-7 text-blue-300" />
                  </div>
                  <div>
                    <div class="text-xs text-blue-300 font-semibold mb-1">DÉCLENCHEUR</div>
                    <div class="font-medium text-white">{{ area.actionService }}</div>
                    <div class="text-xs text-white/60">{{ area.actionName }}</div>
                  </div>
                </div>

                <!-- Arrow -->
                <Icon name="mdi:arrow-right-thick" aria-hidden="true" class="w-8 h-8 text-purple-400 flex-shrink-0" />

                <!-- Reaction -->
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30" aria-hidden="true">
                    <Icon :name="getServiceIcon(area.reactionService)" aria-hidden="true" class="w-7 h-7 text-green-300" />
                  </div>
                  <div>
                    <div class="text-xs text-green-300 font-semibold mb-1">ACTION</div>
                    <div class="font-medium text-white">{{ area.reactionService }}</div>
                    <div class="text-xs text-white/60">{{ area.reactionName }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2">
              <!-- Activer/Désactiver -->
              <button
                @click="handleToggleStatus(area)"
                :aria-label="area.active ? `Désactiver l'automatisation ${area.name}` : `Activer l'automatisation ${area.name}`"
                :class="area.active ? 'bg-orange-600/20 border-orange-500/30 text-orange-300 hover:bg-orange-600/30' : 'bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30'"
                class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon :name="area.active ? 'mdi:pause' : 'mdi:play'" aria-hidden="true" class="w-4 h-4" />
                {{ area.active ? 'Désactiver' : 'Activer' }}
              </button>

              <!-- Exécuter -->
              <button
                @click="handleExecute(area)"
                :disabled="executing === area.id"
                :aria-busy="executing === area.id"
                :aria-label="`Exécuter immédiatement l'automatisation ${area.name}`"
                class="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon :name="executing === area.id ? 'mdi:loading' : 'mdi:play-circle'" aria-hidden="true" :class="executing === area.id ? 'animate-spin' : ''" class="w-4 h-4" />
                {{ executing === area.id ? 'Exécution...' : 'Exécuter maintenant' }}
              </button>

              <!-- Modifier -->
              <button
                @click="handleEdit(area)"
                :aria-label="`Modifier l'automatisation ${area.name}`"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon name="mdi:pencil" aria-hidden="true" class="w-4 h-4" />
                Modifier
              </button>

              <!-- Dupliquer -->
              <button
                @click="handleDuplicate(area)"
                :aria-label="`Dupliquer l'automatisation ${area.name}`"
                class="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-lg hover:bg-indigo-600/30 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon name="mdi:content-copy" aria-hidden="true" class="w-4 h-4" />
                Dupliquer
              </button>

              <!-- Supprimer -->
              <button
                @click="handleDelete(area)"
                :aria-label="`Supprimer l'automatisation ${area.name}`"
                class="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-all font-medium ml-auto focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon name="mdi:delete" aria-hidden="true" class="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- État vide -->
      <div v-else role="status" aria-live="polite" class="text-center py-20">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
          <Icon name="mdi:lightning-bolt-outline" aria-hidden="true" class="w-20 h-20 mx-auto text-white/30 mb-6" />
          <h3 class="text-2xl font-bold text-white mb-3">
            {{ getEmptyStateMessage() }}
          </h3>
          <p class="text-white/60 mb-6">
            {{ getEmptyStateDescription() }}
          </p>
          <NuxtLink
            v-if="!searchQuery && activeFilter === 'all' && !serviceFilter"
            to="/areas/create"
            aria-label="Créer votre première automatisation"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon name="mdi:plus-circle" aria-hidden="true" class="w-5 h-5" />
            Créer ma première AREA
          </NuxtLink>
          <button
            v-else
            @click="resetFilters"
            aria-label="Réinitialiser tous les filtres de recherche"
            class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon name="mdi:filter-off" aria-hidden="true" class="w-5 h-5" />
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </main>

    <!-- Modal de confirmation de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-area-modal-title"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-red-500/30" @click.stop>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center" aria-hidden="true">
              <Icon name="mdi:alert" aria-hidden="true" class="w-6 h-6 text-red-400" />
            </div>
            <h3 id="delete-area-modal-title" class="text-xl font-bold text-white">
              Supprimer cette AREA ?
            </h3>
          </div>
          <p class="text-white/70 mb-2">
            Vous êtes sur le point de supprimer <span class="text-white font-semibold">{{ areaToDelete?.name }}</span>
          </p>
          <p class="text-white/60 text-sm mb-6">
            Cette action est irréversible.
          </p>
          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              :disabled="deleting"
              :aria-busy="deleting"
              aria-label="Confirmer la suppression de l'automatisation"
              class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon :name="deleting ? 'mdi:loading' : 'mdi:delete'" aria-hidden="true" :class="deleting ? 'animate-spin' : ''" class="w-4 h-4" />
              {{ deleting ? "Suppression..." : "Supprimer" }}
            </button>
            <button
              @click="showDeleteModal = false"
              :disabled="deleting"
              aria-label="Annuler la suppression"
              class="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast de succès -->
    <Teleport to="body">
      <div
        v-if="showSuccessToast"
        role="status"
        aria-live="polite"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in-bottom"
      >
        <Icon name="mdi:check-circle" aria-hidden="true" class="w-6 h-6" />
        <span class="font-medium">{{ successMessage }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// Protection de la page - nécessite authentification
definePageMeta({
  middleware: 'auth'
});

// Configuration
useHead({
  title: "Mes AREAs - Relay",
  meta: [{ name: "description", content: "Gérez vos automatisations" }],
});

const config = useRuntimeConfig();
const route = useRoute();

// État réactif
const areas = ref([]);
const loading = ref(false);
const activeFilter = ref("all");
const serviceFilter = ref(route.query.service || "");
const searchQuery = ref("");
const showDeleteModal = ref(false);
const areaToDelete = ref(null);
const deleting = ref(false);
const executing = ref(null);
const showSuccessToast = ref(false);
const successMessage = ref("");

// Computed
const filteredAreas = computed(() => {
  let filtered = areas.value;

  // Filtre par statut
  if (activeFilter.value === "active") {
    filtered = filtered.filter((a) => a.active);
  } else if (activeFilter.value === "inactive") {
    filtered = filtered.filter((a) => !a.active);
  }

  // Filtre par service
  if (serviceFilter.value) {
    filtered = filtered.filter(
      (a) =>
        a.actionService === serviceFilter.value ||
        a.reactionService === serviceFilter.value
    );
  }

  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.actionService?.toLowerCase().includes(query) ||
        a.reactionService?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

const activeAreasCount = computed(() => areas.value.filter((a) => a.active).length);
const inactiveAreasCount = computed(() => areas.value.filter((a) => !a.active).length);

const usedServices = computed(() => {
  const services = new Set();
  areas.value.forEach((area) => {
    if (area.actionService) services.add(area.actionService);
    if (area.reactionService) services.add(area.reactionService);
  });
  return Array.from(services).sort();
});

const usedServicesCount = computed(() => usedServices.value.length);

// Méthodes utilitaires
const getServiceIcon = (serviceName) => {
  const icons = {
    gmail: "mdi:gmail",
    google: "mdi:google",
    facebook: "mdi:facebook",
    github: "mdi:github",
    slack: "mdi:slack",
    discord: "mdi:discord",
    onedrive: "mdi:microsoft-onedrive",
    dropbox: "mdi:dropbox",
    outlook: "mdi:microsoft-outlook",
    timer: "mdi:timer",
    console: "mdi:console",
    spotify: "mdi:spotify",
    reddit: "mdi:reddit",
  };
  return icons[serviceName?.toLowerCase()] || "mdi:puzzle";
};

const showToast = (message) => {
  successMessage.value = message;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

// Méthodes API
const loadAreas = async () => {
  loading.value = true;
  try {
    const response = await $fetch("/api/areas", {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    const data = response.data || response;
    areas.value = data.map(area => ({
      id: area.id,
      name: `${area.action?.service?.name || 'Action'} → ${area.reaction?.service?.name || 'Reaction'}`,
      description: `${area.action?.description || ''} → ${area.reaction?.description || ''}`,
      actionService: area.action?.service?.name || 'Unknown',
      reactionService: area.reaction?.service?.name || 'Unknown',
      actionName: area.action?.description || area.action?.name || 'Action non définie',
      reactionName: area.reaction?.description || area.reaction?.name || 'Réaction non définie',
      active: area.isActive,
      config: area.config || {},
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des AREAs:", error);
    areas.value = [];
  } finally {
    loading.value = false;
  }
};

const handleToggleStatus = async (area) => {
  try {
    await $fetch(`/api/areas/${area.id}`, {
      method: "PATCH",
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
      body: {
        isActive: !area.active
      }
    });

    const index = areas.value.findIndex((a) => a.id === area.id);
    if (index !== -1) {
      areas.value[index].active = !areas.value[index].active;
      showToast(`AREA ${areas.value[index].active ? 'activée' : 'désactivée'} avec succès`);
    }
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    alert("Erreur lors du changement de statut");
  }
};

const getUserId = () => {
  try {
    const token = useCookie("auth-token").value;
    if (!token) return null;

    // Décoder le JWT pour récupérer le userId (champ 'sub' dans le JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // Le userId est dans le champ 'sub' du JWT
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
};

const handleExecute = async (area) => {
  executing.value = area.id;
  try {
    const userId = getUserId();
    if (!userId) {
      alert("Erreur: Utilisateur non authentifié");
      return;
    }

    // Utiliser l'endpoint triggers/execute qui existe dans le backend
    await $fetch("/api/areas/triggers/execute", {
      method: "POST",
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
      body: {
        userId: userId.toString(),
        areaId: area.id.toString(),
        actionType: "manual",
        data: {
          type: "manual_trigger",
          timestamp: new Date().toISOString()
        }
      }
    });

    showToast("AREA exécutée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'exécution:", error);
    alert("Erreur lors de l'exécution de l'AREA");
  } finally {
    executing.value = null;
  }
};

const handleDuplicate = async (area) => {
  // Pour l'instant, la duplication n'est pas disponible dans le backend
  // On peut rediriger vers la création avec les mêmes paramètres
  alert("La fonctionnalité de duplication sera bientôt disponible!");
};

const handleEdit = (area) => {
  // Stocker les données de l'AREA dans le localStorage pour la modification
  if (process.client) {
    localStorage.setItem('area-to-edit', JSON.stringify({
      id: area.id,
      actionService: area.actionService,
      reactionService: area.reactionService,
      config: area.config,
      active: area.active
    }));
  }
  // Rediriger vers la page de création en mode édition
  navigateTo(`/areas/create?edit=${area.id}`);
};

const handleDelete = (area) => {
  areaToDelete.value = area;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!areaToDelete.value) return;

  deleting.value = true;
  try {
    await $fetch(`/api/areas/${areaToDelete.value.id}`, {
      method: "DELETE",
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    areas.value = areas.value.filter((a) => a.id !== areaToDelete.value.id);
    showDeleteModal.value = false;
    areaToDelete.value = null;
    showToast("AREA supprimée avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    alert("Erreur lors de la suppression de l'AREA");
  } finally {
    deleting.value = false;
  }
};

const resetFilters = () => {
  activeFilter.value = "all";
  serviceFilter.value = "";
  searchQuery.value = "";
};

const getEmptyStateMessage = () => {
  if (searchQuery.value) return "Aucune AREA trouvée";
  if (activeFilter.value === "active") return "Aucune AREA active";
  if (activeFilter.value === "inactive") return "Aucune AREA inactive";
  return "Aucune AREA créée";
};

const getEmptyStateDescription = () => {
  if (searchQuery.value || serviceFilter.value)
    return "Essayez de modifier votre recherche ou vos filtres";
  if (activeFilter.value !== "all")
    return "Changez le filtre pour voir vos autres AREAs";
  return "Créez votre première AREA pour commencer à automatiser vos tâches";
};

// Lifecycle
onMounted(() => {
  loadAreas();
});
</script>

<style scoped>
@keyframes slide-in-bottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-bottom {
  animation: slide-in-bottom 0.3s ease-out;
}
</style>
