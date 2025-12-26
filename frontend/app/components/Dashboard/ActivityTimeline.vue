<!-- components/Dashboard/ActivityTimeline.vue -->
<template>
  <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-white flex items-center">
        <Icon name="mdi:clock-outline" class="w-5 h-5 mr-2" />
        Activité récente
      </h3>
      <button
        @click="$emit('refresh')"
        class="text-sm text-blue-300 hover:text-blue-200 transition-colors flex items-center"
      >
        <Icon name="mdi:refresh" class="w-4 h-4 mr-1" />
        Actualiser
      </button>
    </div>

    <!-- Timeline -->
    <div v-if="activities.length > 0" class="space-y-4 max-h-96 overflow-y-auto pr-2">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
      >
        <!-- Icône de statut -->
        <div
          :class="getStatusIconClass(activity.status)"
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Icon :name="getStatusIcon(activity.status)" class="w-5 h-5" />
        </div>

        <!-- Contenu -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h4 class="font-medium text-white truncate">
                {{ activity.areaName }}
              </h4>
              <p class="text-sm text-white/70 mt-1">
                {{ activity.actionName }} → {{ activity.reactionName }}
              </p>
            </div>
            <span class="text-xs text-white/50 whitespace-nowrap">
              {{ formatTime(activity.timestamp) }}
            </span>
          </div>

          <!-- Badge de statut -->
          <div class="flex items-center gap-2 mt-2">
            <span
              :class="getStatusBadgeClass(activity.status)"
              class="px-2 py-1 rounded-lg text-xs font-medium"
            >
              {{ getStatusLabel(activity.status) }}
            </span>
            <span
              v-if="activity.executionTime"
              class="text-xs text-white/50"
            >
              {{ activity.executionTime }}ms
            </span>
          </div>

          <!-- Message d'erreur si échec -->
          <div
            v-if="activity.status === 'failed' && activity.errorMessage"
            class="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2"
          >
            {{ activity.errorMessage }}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0">
          <button
            @click="$emit('view-details', activity)"
            class="text-white/50 hover:text-white/80 transition-colors"
          >
            <Icon name="mdi:chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-else
      class="text-center py-12 text-white/50"
    >
      <Icon name="mdi:information-outline" class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">Aucune activité récente</p>
      <p class="text-xs mt-1">
        Vos automatisations apparaîtront ici une fois exécutées
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['refresh', 'view-details']);

// Méthodes utilitaires
const getStatusIcon = (status) => {
  const icons = {
    success: "mdi:check-circle",
    failed: "mdi:alert-circle",
    running: "mdi:loading",
    pending: "mdi:clock-outline",
  };
  return icons[status] || "mdi:help-circle";
};

const getStatusIconClass = (status) => {
  const classes = {
    success: "bg-green-500/20 text-green-400",
    failed: "bg-red-500/20 text-red-400",
    running: "bg-blue-500/20 text-blue-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };
  return classes[status] || "bg-gray-500/20 text-gray-400";
};

const getStatusBadgeClass = (status) => {
  const classes = {
    success: "bg-green-500/20 text-green-300 border border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border border-red-500/30",
    running: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  };
  return classes[status] || "bg-gray-500/20 text-gray-300 border border-gray-500/30";
};

const getStatusLabel = (status) => {
  const labels = {
    success: "Succès",
    failed: "Échec",
    running: "En cours",
    pending: "En attente",
  };
  return labels[status] || "Inconnu";
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
