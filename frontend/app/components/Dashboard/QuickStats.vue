<!-- components/Dashboard/QuickStats.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Services connectés -->
    <div
      class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
        >
          <Icon name="mdi:link-variant" class="w-6 h-6 text-blue-400" />
        </div>
        <NuxtLink
          to="/services"
          class="text-xs text-blue-300 hover:text-blue-200 transition-colors"
        >
          Voir tout →
        </NuxtLink>
      </div>
      <div class="text-3xl font-bold text-white mb-1">
        {{ stats.connectedServices }}
      </div>
      <div class="text-sm text-white/70">Services connectés</div>
      <div class="mt-2 text-xs text-white/50">
        sur {{ stats.totalServices }} disponibles
      </div>
    </div>

    <!-- AREAs actives -->
    <div
      class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
        >
          <Icon name="mdi:lightning-bolt" class="w-6 h-6 text-green-400" />
        </div>
        <NuxtLink
          to="/areas"
          class="text-xs text-green-300 hover:text-green-200 transition-colors"
        >
          Gérer →
        </NuxtLink>
      </div>
      <div class="text-3xl font-bold text-white mb-1">{{ stats.activeAreas }}</div>
      <div class="text-sm text-white/70">AREAs actives</div>
      <div class="mt-2 text-xs text-white/50">
        {{ stats.totalAreas }} au total
      </div>
    </div>

    <!-- Exécutions aujourd'hui -->
    <div
      class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
        >
          <Icon name="mdi:play-circle" class="w-6 h-6 text-purple-400" />
        </div>
        <span
          :class="
            stats.executionsTrend > 0
              ? 'text-green-400'
              : stats.executionsTrend < 0
              ? 'text-red-400'
              : 'text-white/50'
          "
          class="text-xs font-medium"
        >
          {{ stats.executionsTrend > 0 ? "↑" : stats.executionsTrend < 0 ? "↓" : "→" }}
          {{ Math.abs(stats.executionsTrend) }}%
        </span>
      </div>
      <div class="text-3xl font-bold text-white mb-1">
        {{ stats.executionsToday }}
      </div>
      <div class="text-sm text-white/70">Exécutions aujourd'hui</div>
      <div class="mt-2 text-xs text-white/50">
        vs {{ stats.executionsYesterday }} hier
      </div>
    </div>

    <!-- Taux de succès -->
    <div
      class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
    >
      <div class="flex items-center justify-between mb-4">
        <div
          class="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
        >
          <Icon name="mdi:chart-line" class="w-6 h-6 text-yellow-400" />
        </div>
        <span
          :class="getSuccessRateTextColor(stats.successRate)"
          class="text-xs font-medium"
        >
          {{ getSuccessRateLabel(stats.successRate) }}
        </span>
      </div>
      <div class="text-3xl font-bold text-white mb-1">{{ stats.successRate }}%</div>
      <div class="text-sm text-white/70">Taux de succès</div>
      <div class="mt-2 w-full bg-white/10 rounded-full h-2">
        <div
          :class="getSuccessRateColor(stats.successRate)"
          :style="{ width: `${stats.successRate}%` }"
          class="h-2 rounded-full transition-all duration-500"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      connectedServices: 0,
      totalServices: 0,
      activeAreas: 0,
      totalAreas: 0,
      executionsToday: 0,
      executionsYesterday: 0,
      executionsTrend: 0,
      successRate: 0,
    }),
  },
});

const getSuccessRateColor = (rate) => {
  if (rate >= 90) return "bg-green-400";
  if (rate >= 70) return "bg-yellow-400";
  return "bg-red-400";
};

const getSuccessRateTextColor = (rate) => {
  if (rate >= 90) return "text-green-400";
  if (rate >= 70) return "text-yellow-400";
  return "text-red-400";
};

const getSuccessRateLabel = (rate) => {
  if (rate >= 90) return "Excellent";
  if (rate >= 70) return "Bon";
  return "À améliorer";
};
</script>
