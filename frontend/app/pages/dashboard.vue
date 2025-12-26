<!-- pages/dashboard.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <SkipLinks />

    <!-- Navigation -->
    <nav class="bg-white/10 backdrop-blur-xl border-b border-white/20" role="navigation" aria-label="Navigation principale">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="flex items-center space-x-3 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded" aria-label="Retour à l'accueil">
            <span class="text-2xl font-bold text-white">Relay</span>
          </NuxtLink>
          <div class="flex space-x-2 items-center" role="menubar" aria-label="Menu de navigation">
            <ColorblindSelector />
            <NuxtLink
              to="/dashboard"
              class="text-white px-4 py-2 rounded-lg bg-white/20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
              role="menuitem"
              aria-label="Dashboard (page actuelle)"
              aria-current="page"
            >
              <Icon name="mdi:view-dashboard" class="w-4 h-4 inline mr-2" aria-hidden="true" />
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/services"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
              role="menuitem"
              aria-label="Services"
            >
              <Icon name="mdi:puzzle-piece" class="w-4 h-4 inline mr-2" aria-hidden="true" />
              Services
            </NuxtLink>
            <NuxtLink
              to="/areas"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
              role="menuitem"
              aria-label="AREAs"
            >
              <Icon name="mdi:lightning-bolt" class="w-4 h-4 inline mr-2" aria-hidden="true" />
              AREAs
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
              role="menuitem"
              aria-label="Profil"
            >
              <Icon name="mdi:account" class="w-4 h-4 inline mr-2" aria-hidden="true" />
              Profil
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header class="bg-white/5 backdrop-blur-sm border-b border-white/10 py-8" role="banner">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">
              Bienvenue sur votre Dashboard
            </h1>
            <p class="text-blue-200 text-lg">
              Gérez vos automatisations en temps réel
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="refreshData"
              :disabled="loading"
              :aria-busy="loading"
              class="flex items-center px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Actualiser les données"
            >
              <Icon :name="loading ? 'mdi:loading' : 'mdi:refresh'" :class="['w-5 h-5 mr-2', loading ? 'animate-spin' : '']" aria-hidden="true" />
              Actualiser
            </button>
            <NuxtLink
              to="/areas/create"
              class="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Créer une nouvelle AREA"
            >
              <Icon name="mdi:plus" class="w-5 h-5 mr-2" aria-hidden="true" />
              Créer une AREA
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading && !areas.length" class="max-w-7xl mx-auto px-4 py-12 text-center" role="status" aria-live="polite">
      <Icon name="mdi:loading" class="w-12 h-12 text-white/50 animate-spin mx-auto mb-4" aria-hidden="true" />
      <p class="text-white/70">Chargement de vos données...</p>
    </div>

    <!-- Contenu principal -->
    <main v-else id="main-content" role="main" class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <!-- Statistiques rapides -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-label="Statistiques rapides">
        <!-- Total AREAs -->
        <article class="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-500/30 rounded-xl" aria-hidden="true">
              <Icon name="mdi:lightning-bolt" class="w-6 h-6 text-blue-300" />
            </div>
            <span class="text-xs text-blue-300 font-medium">Total</span>
          </div>
          <h2 class="text-3xl font-bold text-white mb-1">{{ stats.totalAreas }}</h2>
          <p class="text-sm text-blue-200">AREAs créées</p>
        </article>

        <!-- AREAs actives -->
        <article class="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-green-500/30 rounded-xl" aria-hidden="true">
              <Icon name="mdi:check-circle" class="w-6 h-6 text-green-300" />
            </div>
            <span class="text-xs text-green-300 font-medium">Actif</span>
          </div>
          <h2 class="text-3xl font-bold text-white mb-1">{{ stats.activeAreas }}</h2>
          <p class="text-sm text-green-200">AREAs actives</p>
        </article>

        <!-- Services connectés -->
        <article class="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-purple-500/30 rounded-xl" aria-hidden="true">
              <Icon name="mdi:puzzle-piece" class="w-6 h-6 text-purple-300" />
            </div>
            <span class="text-xs text-purple-300 font-medium">Services</span>
          </div>
          <h2 class="text-3xl font-bold text-white mb-1">{{ stats.connectedServices }}</h2>
          <p class="text-sm text-purple-200">Services connectés</p>
        </article>

        <!-- Dernière exécution -->
        <article class="bg-gradient-to-br from-orange-600/20 to-orange-700/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-orange-500/30 rounded-xl" aria-hidden="true">
              <Icon name="mdi:clock-outline" class="w-6 h-6 text-orange-300" />
            </div>
            <span class="text-xs text-orange-300 font-medium">Activité</span>
          </div>
          <h2 class="text-lg font-bold text-white mb-1">{{ lastExecutionTime }}</h2>
          <p class="text-sm text-orange-200">Dernière exécution</p>
        </article>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale (2/3) -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Mes AREAs récentes -->
          <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-white flex items-center">
                <Icon name="mdi:timeline-clock" class="w-5 h-5 mr-2 text-blue-400" />
                Mes AREAs récentes
              </h3>
              <NuxtLink
                to="/areas"
                class="text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center"
              >
                Voir tout
                <Icon name="mdi:arrow-right" class="w-4 h-4 ml-1" />
              </NuxtLink>
            </div>

            <div v-if="recentAreas.length > 0" class="space-y-3">
              <div
                v-for="area in recentAreas"
                :key="area.id"
                class="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
                @click="navigateTo(`/areas/${area.id}`)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="flex items-center gap-2 text-white">
                        <Icon :name="getServiceIcon(area.action.service.name)" class="w-5 h-5" />
                        <span class="font-medium">{{ area.action.service.name }}</span>
                      </div>
                      <Icon name="mdi:arrow-right" class="w-4 h-4 text-white/50" />
                      <div class="flex items-center gap-2 text-white">
                        <Icon :name="getServiceIcon(area.reaction.service.name)" class="w-5 h-5" />
                        <span class="font-medium">{{ area.reaction.service.name }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-white/60">
                      <span>{{ area.action.description }}</span>
                      <Icon name="mdi:chevron-right" class="w-3 h-3" />
                      <span>{{ area.reaction.description }}</span>
                    </div>
                    <div class="flex items-center gap-3 mt-2 text-xs text-white/50">
                      <span>Créée {{ formatDate(area.createdAt) }}</span>
                      <span v-if="area.lastTriggeredAt">• Dernière exécution {{ formatDate(area.lastTriggeredAt) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 ml-4">
                    <span
                      :class="
                        area.isActive
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                      "
                      class="px-3 py-1 rounded-full text-xs flex items-center gap-1 whitespace-nowrap"
                    >
                      <Icon
                        :name="area.isActive ? 'mdi:check-circle' : 'mdi:pause-circle'"
                        class="w-3 h-3"
                      />
                      {{ area.isActive ? 'Actif' : 'Pausé' }}
                    </span>
                    <Icon name="mdi:chevron-right" class="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 text-white/50">
              <Icon name="mdi:lightning-bolt-outline" class="w-16 h-16 mx-auto mb-4 text-white/30" />
              <p class="text-lg mb-2">Aucune AREA créée</p>
              <p class="text-sm mb-4">Commencez par créer votre première automatisation</p>
              <NuxtLink
                to="/areas/create"
                class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <Icon name="mdi:plus" class="w-4 h-4 inline mr-2" />
                Créer ma première AREA
              </NuxtLink>
            </div>
          </div>

          <!-- Répartition par service -->
          <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 class="text-xl font-bold text-white mb-6 flex items-center">
              <Icon name="mdi:chart-donut" class="w-5 h-5 mr-2 text-purple-400" />
              Répartition par service
            </h3>

            <div v-if="serviceBreakdown.length > 0" class="space-y-4">
              <div v-for="service in serviceBreakdown" :key="service.name" class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <Icon :name="getServiceIcon(service.name)" class="w-4 h-4 text-white" />
                    <span class="text-white font-medium">{{ service.name }}</span>
                  </div>
                  <span class="text-white/70">{{ service.count }} AREA{{ service.count > 1 ? 's' : '' }}</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    :style="{ width: `${(service.count / stats.totalAreas) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-white/50">
              <p class="text-sm">Aucune donnée disponible</p>
            </div>
          </div>
        </div>

        <!-- Colonne latérale (1/3) -->
        <div class="space-y-8">
          <!-- Application Mobile -->
          <div class="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center">
              <Icon name="mdi:cellphone-download" class="w-5 h-5 mr-2 text-green-300" />
              Application Mobile
            </h3>
            <p class="text-sm text-white/80 mb-4">
              Téléchargez l'application mobile pour gérer vos automatisations partout
            </p>
            <a
              :href="`${config.public.apiBaseUrl}/client.apk`"
              download="area-client.apk"
              class="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
            >
              <Icon name="mdi:android" class="w-5 h-5" />
              Télécharger l'APK
            </a>
            <p class="text-xs text-white/50 mt-3 text-center">
              Android uniquement • Version release
            </p>
          </div>

          <!-- Actions rapides -->
          <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center">
              <Icon name="mdi:rocket-launch" class="w-5 h-5 mr-2" />
              Actions rapides
            </h3>
            <div class="space-y-3">
              <NuxtLink
                to="/services"
                class="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
              >
                <Icon
                  name="mdi:link-plus"
                  class="w-5 h-5 text-blue-400 mr-3"
                />
                <span class="text-white text-sm flex-1">Connecter un service</span>
                <Icon
                  name="mdi:arrow-right"
                  class="w-4 h-4 text-white/50 group-hover:text-white/80"
                />
              </NuxtLink>

              <NuxtLink
                to="/areas/create"
                class="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
              >
                <Icon
                  name="mdi:lightning-bolt-circle"
                  class="w-5 h-5 text-green-400 mr-3"
                />
                <span class="text-white text-sm flex-1">Créer une AREA</span>
                <Icon
                  name="mdi:arrow-right"
                  class="w-4 h-4 text-white/50 group-hover:text-white/80"
                />
              </NuxtLink>

              <NuxtLink
                to="/areas"
                class="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
              >
                <Icon
                  name="mdi:cog-outline"
                  class="w-5 h-5 text-purple-400 mr-3"
                />
                <span class="text-white text-sm flex-1">Gérer mes AREAs</span>
                <Icon
                  name="mdi:arrow-right"
                  class="w-4 h-4 text-white/50 group-hover:text-white/80"
                />
              </NuxtLink>
            </div>
          </div>

          <!-- Services disponibles -->
          <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center">
              <Icon name="mdi:apps" class="w-5 h-5 mr-2" />
              Services disponibles
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="service in availableServices.slice(0, 9)"
                :key="service.name"
                class="flex flex-col items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                :title="service.name"
              >
                <Icon :name="getServiceIcon(service.name)" class="w-8 h-8 text-white mb-2" />
                <span class="text-xs text-white/70 text-center truncate w-full">{{ service.name }}</span>
              </div>
            </div>
            <NuxtLink
              to="/services"
              class="block mt-4 text-center text-sm text-blue-300 hover:text-blue-200 transition-colors"
            >
              Voir tous les services →
            </NuxtLink>
          </div>

          <!-- Conseils -->
          <div class="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center">
              <Icon name="mdi:lightbulb-on" class="w-5 h-5 mr-2 text-yellow-300" />
              Conseil
            </h3>
            <p class="text-sm text-white/80 mb-4">
              Saviez-vous que vous pouvez combiner plusieurs services pour créer des automatisations puissantes ?
            </p>
            <NuxtLink
              to="/areas/create"
              class="text-sm text-yellow-300 hover:text-yellow-200 transition-colors flex items-center"
            >
              Essayer maintenant
              <Icon name="mdi:arrow-right" class="w-4 h-4 ml-1" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});

// Configuration
useHead({
  title: "Dashboard - Relay",
  meta: [
    {
      name: "description",
      content: "Gérez vos automatisations et services connectés",
    },
  ],
});

const config = useRuntimeConfig();
const loading = ref(true);

// État réactif
const areas = ref([]);
const availableServices = ref([]);

// Statistiques calculées
const stats = computed(() => {
  return {
    totalAreas: areas.value.length,
    activeAreas: areas.value.filter(a => a.isActive).length,
    connectedServices: new Set(
      areas.value.flatMap(a => [a.action.service.name, a.reaction.service.name])
    ).size,
  };
});

// AREAs récentes (dernières 5)
const recentAreas = computed(() => {
  return areas.value.slice(0, 5);
});

// Dernière exécution
const lastExecutionTime = computed(() => {
  const triggered = areas.value.filter(a => a.lastTriggeredAt);
  if (triggered.length === 0) return 'Jamais';

  const latest = triggered.reduce((max, area) => {
    const areaDate = new Date(area.lastTriggeredAt);
    return areaDate > max ? areaDate : max;
  }, new Date(0));

  return formatDate(latest);
});

// Répartition par service
const serviceBreakdown = computed(() => {
  const serviceCount = {};

  areas.value.forEach(area => {
    // Compter les actions
    const actionService = area.action.service.name;
    serviceCount[actionService] = (serviceCount[actionService] || 0) + 1;

    // Compter les réactions
    const reactionService = area.reaction.service.name;
    serviceCount[reactionService] = (serviceCount[reactionService] || 0) + 1;
  });

  return Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
});

// Icônes des services
const serviceIcons = {
  gmail: "mdi:gmail",
  google: "mdi:google",
  outlook: "mdi:microsoft-outlook",
  slack: "mdi:slack",
  discord: "mdi:discord",
  github: "mdi:github",
  onedrive: "mdi:microsoft-onedrive",
  dropbox: "mdi:dropbox",
  facebook: "mdi:facebook",
  instagram: "mdi:instagram",
  twitter: "mdi:twitter",
  x: "mdi:twitter",
  timer: "mdi:timer",
  console: "mdi:console",
  spotify: "mdi:spotify",
  reddit: "mdi:reddit",
  notion: "simple-icons:notion",
};

// Méthodes
const getServiceIcon = (serviceName) => {
  return serviceIcons[serviceName?.toLowerCase()] || "mdi:puzzle";
};

const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const loadDashboardData = async () => {
  loading.value = true;

  try {
    // Charger les AREAs de l'utilisateur
    const areasResponse = await $fetch("/api/areas", {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    if (areasResponse.success) {
      areas.value = areasResponse.data || [];
    }

    // Charger les services disponibles
    const servicesResponse = await $fetch("/api/areas/services", {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    if (servicesResponse.success) {
      availableServices.value = servicesResponse.data || [];
    }

  } catch (error) {
    console.error("Erreur lors du chargement du dashboard:", error);
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadDashboardData();
};

// Lifecycle
onMounted(() => {
  loadDashboardData();
});
</script>
