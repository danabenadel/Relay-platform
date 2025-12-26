<!-- components/AREA/SpotifyReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- play_track -->
    <div v-if="reactionType === 'play_track'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Track ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.trackId"
          type="text"
          placeholder="11dFghVXANMlKmJXsNCbNl"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          ID de la piste à jouer
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          🎵 Lance la lecture de la piste spécifiée
        </p>
      </div>
    </div>

    <!-- add_to_playlist -->
    <div v-else-if="reactionType === 'add_to_playlist'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Playlist ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.playlistId"
          type="text"
          placeholder="37i9dQZF1DXcBWIGoYBM5M"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Track ID (optionnel)
        </label>
        <input
          v-model="localConfig.trackId"
          type="text"
          placeholder="11dFghVXANMlKmJXsNCbNl"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour ajouter la piste détectée par l'action
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ➕ Ajoute une piste à la playlist
        </p>
      </div>
    </div>

    <!-- create_playlist -->
    <div v-else-if="reactionType === 'create_playlist'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Nom de la playlist <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.playlistName"
          type="text"
          placeholder="Ma Playlist AREA"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          v-model="localConfig.description"
          placeholder="Créée automatiquement par AREA"
          rows="2"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="flex items-center space-x-3">
        <input
          v-model="localConfig.isPublic"
          type="checkbox"
          id="playlist-public"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
          @change="emit('update:config', localConfig)"
        />
        <label for="playlist-public" class="text-sm text-white">
          Playlist publique
        </label>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          📁 Crée une nouvelle playlist dans votre bibliothèque
        </p>
      </div>
    </div>

    <!-- save_track -->
    <div v-else-if="reactionType === 'save_track'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Track ID (optionnel)
        </label>
        <input
          v-model="localConfig.trackId"
          type="text"
          placeholder="11dFghVXANMlKmJXsNCbNl"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour sauvegarder la piste détectée par l'action
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ❤️ Ajoute la piste à vos favoris Spotify
        </p>
      </div>
    </div>

    <!-- pause_playback -->
    <div v-else-if="reactionType === 'pause_playback'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✅ Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          ⏸️ Met en pause la lecture en cours
        </p>
      </div>
    </div>

    <!-- resume_playback -->
    <div v-else-if="reactionType === 'resume_playback'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✅ Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          ▶️ Reprend la lecture
        </p>
      </div>
    </div>

    <!-- next_track -->
    <div v-else-if="reactionType === 'next_track'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✅ Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          ⏭️ Passe à la piste suivante
        </p>
      </div>
    </div>

    <!-- previous_track -->
    <div v-else-if="reactionType === 'previous_track'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✅ Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          ⏮️ Retourne à la piste précédente
        </p>
      </div>
    </div>

    <!-- set_volume -->
    <div v-else-if="reactionType === 'set_volume'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Volume <span class="text-red-400">*</span>
          <span class="text-white/70 font-normal">({{ localConfig.volume || 50 }}%)</span>
        </label>
        <input
          v-model.number="localConfig.volume"
          type="range"
          min="0"
          max="100"
          step="5"
          class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
          @input="emit('update:config', localConfig)"
        />
        <div class="flex justify-between text-xs text-white/50 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          🔊 Règle le volume de la lecture (0-100%)
        </p>
      </div>
    </div>

    <!-- shuffle_toggle -->
    <div v-else-if="reactionType === 'shuffle_toggle'" class="space-y-3">
      <div class="flex items-center space-x-3">
        <input
          v-model="localConfig.state"
          type="checkbox"
          id="shuffle-state"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
          @change="emit('update:config', localConfig)"
        />
        <label for="shuffle-state" class="text-sm text-white">
          Activer la lecture aléatoire
        </label>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          🔀 {{ localConfig.state ? 'Active' : 'Désactive' }} le mode aléatoire
        </p>
      </div>
    </div>

    <!-- Unknown reaction -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        ⚠️ Reaction inconnue: {{ reactionType }}
      </p>
    </div>

    <!-- Helper: How to find IDs -->
    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span>💡 Comment trouver les IDs Spotify ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Playlist ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez Spotify et allez sur une playlist</li>
          <li>Cliquez sur les 3 points → Partager → Copier le lien</li>
          <li>URL: https://open.spotify.com/playlist/<strong class="text-green-300">37i9dQZF1DX...</strong></li>
          <li>L'ID est la partie après /playlist/</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Track ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Clic droit sur une chanson → Partager → Copier le lien</li>
          <li>URL: https://open.spotify.com/track/<strong class="text-green-300">11dFghVXAN...</strong></li>
          <li>L'ID est la partie après /track/</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  reactionType: {
    type: String,
    required: true,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:config']);

// Initialize with default values
const getDefaultConfig = () => {
  switch (props.reactionType) {
    case 'set_volume':
      return { volume: 50, ...props.config };
    case 'shuffle_toggle':
      return { state: true, ...props.config };
    case 'create_playlist':
      return {
        playlistName: 'Ma Playlist AREA',
        description: 'Créée automatiquement par AREA',
        isPublic: false,
        ...props.config
      };
    default:
      return { ...props.config };
  }
};

const localConfig = ref(getDefaultConfig());
const showHelp = ref(false);

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = getDefaultConfig();
}, { deep: true });

// Emit initial config
onMounted(() => {
  emit('update:config', localConfig.value);
});
</script>
