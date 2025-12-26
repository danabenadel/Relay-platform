<!-- components/Dashboard/AreaSuggestions.vue -->
<template>
  <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-white flex items-center">
        <Icon name="mdi:lightbulb-on" class="w-5 h-5 mr-2 text-yellow-400" />
        Suggestions pour vous
      </h3>
      <span class="text-xs text-white/50">Basées sur vos services</span>
    </div>

    <!-- Suggestions -->
    <div v-if="suggestions.length > 0" class="space-y-4">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-xl hover:border-white/20 transition-all group"
      >
        <!-- Badge populaire en haut à droite -->
        <div v-if="suggestion.popular" class="flex justify-end mb-2">
          <span
            class="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-lg border border-yellow-500/30"
          >
            🔥 Populaire
          </span>
        </div>

        <!-- Icônes des services -->
        <div class="flex items-center justify-center gap-2 mb-4">
          <div
            class="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center"
          >
            <Icon :name="suggestion.actionServiceIcon" class="w-6 h-6 text-white" />
          </div>
          <Icon name="mdi:arrow-right" class="w-5 h-5 text-white/50" />
          <div
            class="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center"
          >
            <Icon :name="suggestion.reactionServiceIcon" class="w-6 h-6 text-white" />
          </div>
        </div>

        <!-- Contenu -->
        <div class="text-center mb-3">
          <h4 class="font-medium text-white mb-2">
            {{ suggestion.title }}
          </h4>
          <p class="text-sm text-white/70">
            {{ suggestion.description }}
          </p>
        </div>

        <!-- Example flow -->
        <div class="text-xs text-white/60 bg-white/5 rounded-lg p-3 mb-3">
          <div class="flex items-start gap-2">
            <span class="text-blue-400 flex-shrink-0">Si</span>
            <span class="flex-1">{{ suggestion.actionExample }}</span>
          </div>
          <div class="flex items-start gap-2 mt-2">
            <span class="text-green-400 flex-shrink-0">Alors</span>
            <span class="flex-1">{{ suggestion.reactionExample }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            @click="$emit('create-area', suggestion)"
            class="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Créer cette AREA
          </button>
          <button
            @click="$emit('dismiss', suggestion)"
            class="flex-1 sm:flex-none px-3 py-2 bg-white/5 text-white/70 rounded-lg text-xs hover:bg-white/10 transition-all"
          >
            Ignorer
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-else
      class="text-center py-8 text-white/50"
    >
      <Icon name="mdi:check-circle" class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">Aucune suggestion pour le moment</p>
      <p class="text-xs mt-1">
        Connectez plus de services pour obtenir des suggestions
      </p>
      <NuxtLink
        to="/services"
        class="inline-block mt-4 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs hover:bg-blue-600/30 transition-all"
      >
        Mes services
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  suggestions: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['create-area', 'dismiss']);
</script>
