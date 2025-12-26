<!-- components/Services/ConnectedServiceCard.vue -->
<template>
  <div
    class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div
          :class="getServiceIconClass(service.name)"
          class="w-14 h-14 rounded-xl flex items-center justify-center"
        >
          <Icon :name="getServiceIcon(service.name)" class="w-8 h-8" />
        </div>
        <div>
          <h3 class="font-bold text-lg text-white capitalize">
            {{ service.name }}
          </h3>
          <p class="text-sm text-white/60">
            Connecté {{ formatConnectionDate(service.connectedAt) }}
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <div
        :class="getStatusBadgeClass(service.status)"
        class="px-3 py-1.5 rounded-full text-xs font-medium border"
      >
        {{ getStatusLabel(service.status) }}
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-3 bg-white/5 rounded-lg">
        <div class="text-xl font-bold text-blue-400">{{ service.areasCount || 0 }}</div>
        <div class="text-xs text-white/60">AREAs</div>
      </div>
      <div class="text-center p-3 bg-white/5 rounded-lg">
        <div class="text-xl font-bold text-green-400">{{ service.executionsCount || 0 }}</div>
        <div class="text-xs text-white/60">Exécutions</div>
      </div>
      <div class="text-center p-3 bg-white/5 rounded-lg">
        <div class="text-xl font-bold text-purple-400">{{ service.lastExecution || 'N/A' }}</div>
        <div class="text-xs text-white/60">Dernière</div>
      </div>
    </div>

    <!-- AREAs utilisant ce service -->
    <div v-if="service.areas && service.areas.length > 0" class="mb-4">
      <div class="text-xs text-white/50 mb-2">AREAs utilisant ce service:</div>
      <div class="space-y-1">
        <div
          v-for="area in service.areas.slice(0, 3)"
          :key="area.id"
          class="flex items-center gap-2 text-xs text-white/70 bg-white/5 rounded-lg p-2"
        >
          <Icon name="mdi:lightning-bolt" class="w-3 h-3 text-yellow-400" />
          <span class="flex-1 truncate">{{ area.name }}</span>
          <Icon
            :name="area.active ? 'mdi:check-circle' : 'mdi:pause-circle'"
            :class="area.active ? 'text-green-400' : 'text-gray-400'"
            class="w-4 h-4"
          />
        </div>
        <div v-if="service.areas.length > 3" class="text-xs text-white/40 pl-2">
          +{{ service.areas.length - 3 }} autres...
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        @click="$emit('refresh-token', service)"
        :disabled="service.status !== 'expired'"
        class="flex-1 py-2 px-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Icon name="mdi:refresh" class="w-4 h-4" />
        Rafraîchir
      </button>

      <button
        @click="$emit('view-areas', service)"
        class="flex-1 py-2 px-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all text-sm flex items-center justify-center gap-2"
      >
        <Icon name="mdi:format-list-bulleted" class="w-4 h-4" />
        Voir AREAs
      </button>

      <button
        @click="$emit('disconnect', service)"
        class="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-all text-sm flex items-center justify-center gap-2"
      >
        <Icon name="mdi:link-off" class="w-4 h-4" />
        Déconnecter
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['refresh-token', 'view-areas', 'disconnect']);

// Utilitaires
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
    instagram: "mdi:instagram",
    youtube: "mdi:youtube",
    spotify: "mdi:spotify",
    timer: "mdi:timer",
  };
  return icons[serviceName.toLowerCase()] || "mdi:cog";
};

const getServiceIconClass = (serviceName) => {
  const classes = {
    gmail: "bg-red-500/20 text-red-300",
    google: "bg-red-500/20 text-red-300",
    facebook: "bg-blue-500/20 text-blue-300",
    github: "bg-gray-500/20 text-gray-300",
    slack: "bg-purple-500/20 text-purple-300",
    discord: "bg-indigo-500/20 text-indigo-300",
    onedrive: "bg-blue-500/20 text-blue-300",
    dropbox: "bg-blue-500/20 text-blue-300",
    outlook: "bg-blue-500/20 text-blue-300",
    instagram: "bg-pink-500/20 text-pink-300",
    youtube: "bg-red-500/20 text-red-300",
    spotify: "bg-green-500/20 text-green-300",
    timer: "bg-yellow-500/20 text-yellow-300",
  };
  return classes[serviceName.toLowerCase()] || "bg-gray-500/20 text-gray-300";
};

const getStatusBadgeClass = (status) => {
  const classes = {
    active: "bg-green-500/20 text-green-300 border-green-500/30",
    expired: "bg-red-500/20 text-red-300 border-red-500/30",
    expiring_soon: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };
  return classes[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
};

const getStatusLabel = (status) => {
  const labels = {
    active: "Actif",
    expired: "Expiré",
    expiring_soon: "Expire bientôt",
  };
  return labels[status] || "Inconnu";
};

const formatConnectionDate = (date) => {
  if (!date) return "récemment";
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaines`;
  return `il y a ${Math.floor(diffDays / 30)} mois`;
};
</script>
