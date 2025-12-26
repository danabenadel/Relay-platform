<!-- components/Areas/AreaCard.vue -->
<template>
  <div
    class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-bold text-lg text-white">{{ area.name }}</h3>
          <button
            v-if="area.favorite"
            class="text-yellow-400"
            @click="$emit('toggle-favorite', area)"
          >
            <Icon name="mdi:star" class="w-4 h-4" />
          </button>
          <button
            v-else
            class="text-white/30 hover:text-yellow-400 transition-colors"
            @click="$emit('toggle-favorite', area)"
          >
            <Icon name="mdi:star-outline" class="w-4 h-4" />
          </button>
        </div>
        <p v-if="area.description" class="text-sm text-white/60 mb-3">
          {{ area.description }}
        </p>
      </div>

      <!-- Toggle active/inactive -->
      <div class="flex items-center gap-2">
        <button
          @click="$emit('toggle-status', area)"
          :class="
            area.active
              ? 'bg-green-500/20 border-green-500/40'
              : 'bg-gray-500/20 border-gray-500/40'
          "
          class="relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <span
            :class="area.active ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          ></span>
        </button>
      </div>
    </div>

    <!-- Workflow visualization -->
    <div class="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
      <div class="flex items-center gap-3">
        <!-- Action -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"
            >
              <Icon :name="getServiceIcon(area.actionService)" class="w-5 h-5 text-blue-300" />
            </div>
            <div class="flex-1">
              <div class="text-xs text-blue-300 font-medium">SI</div>
              <div class="text-xs text-white/80">{{ area.actionService }}</div>
            </div>
          </div>
          <div class="text-xs text-white/60 pl-10">
            {{ area.actionName || 'Action configurée' }}
          </div>
        </div>

        <!-- Arrow -->
        <Icon name="mdi:arrow-right" class="w-6 h-6 text-white/40 flex-shrink-0" />

        <!-- Reaction -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"
            >
              <Icon :name="getServiceIcon(area.reactionService)" class="w-5 h-5 text-green-300" />
            </div>
            <div class="flex-1">
              <div class="text-xs text-green-300 font-medium">ALORS</div>
              <div class="text-xs text-white/80">{{ area.reactionService }}</div>
            </div>
          </div>
          <div class="text-xs text-white/60 pl-10">
            {{ area.reactionName || 'Réaction configurée' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="text-center p-2 bg-white/5 rounded-lg">
        <div class="text-lg font-bold text-white">
          {{ area.executionsCount || 0 }}
        </div>
        <div class="text-xs text-white/60">Exécutions</div>
      </div>
      <div class="text-center p-2 bg-white/5 rounded-lg">
        <div class="text-lg font-bold text-green-400">
          {{ area.successRate || 0 }}%
        </div>
        <div class="text-xs text-white/60">Succès</div>
      </div>
      <div class="text-center p-2 bg-white/5 rounded-lg">
        <div
          class="text-xs font-medium text-white/70"
          :title="formatLastExecution(area.lastExecution)"
        >
          {{ area.lastExecution ? formatRelativeTime(area.lastExecution) : 'Jamais' }}
        </div>
        <div class="text-xs text-white/60">Dernière</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <NuxtLink
        :to="`/areas/${area.id}`"
        class="flex-1 py-2 px-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-all text-sm text-center"
      >
        <Icon name="mdi:eye" class="w-4 h-4 inline mr-1" />
        Détails
      </NuxtLink>

      <button
        @click="$emit('duplicate', area)"
        class="flex-1 py-2 px-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-all text-sm"
      >
        <Icon name="mdi:content-copy" class="w-4 h-4 inline mr-1" />
        Dupliquer
      </button>

      <button
        @click="$emit('delete', area)"
        class="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-all text-sm"
      >
        <Icon name="mdi:delete" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  area: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  'toggle-status',
  'toggle-favorite',
  'duplicate',
  'delete',
]);

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
    timer: "mdi:timer",
  };
  return icons[serviceName?.toLowerCase()] || "mdi:cog";
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "maintenant";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  return `${Math.floor(diffDays / 7)}sem`;
};

const formatLastExecution = (timestamp) => {
  if (!timestamp) return "Jamais exécuté";
  const date = new Date(timestamp);
  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
