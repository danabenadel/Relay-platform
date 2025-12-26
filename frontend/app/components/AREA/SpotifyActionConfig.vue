<!-- components/AREA/SpotifyActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- new_track_in_playlist -->
    <div v-if="actionType === 'new_track_in_playlist'" class="space-y-3">
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
        <p class="text-xs text-white/50 mt-1">
          Trouvez l'ID dans l'URL Spotify: spotify.com/playlist/<strong>ID</strong>
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
           Cette action se déclenche quand une nouvelle piste est ajoutée à la playlist
        </p>
      </div>
    </div>

    <!-- new_saved_track -->
    <div v-else-if="actionType === 'new_saved_track'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
           Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          Cette action se déclenche automatiquement quand vous ajoutez une piste à vos favoris Spotify
        </p>
      </div>
    </div>

    <!-- song_playing -->
    <div v-else-if="actionType === 'song_playing'" class="space-y-3">
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
          Laissez vide pour déclencher sur n'importe quelle chanson
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
           Se déclenche quand la piste spécifiée (ou n'importe laquelle) est en lecture
        </p>
      </div>
    </div>

    <!-- playlist_updated -->
    <div v-else-if="actionType === 'playlist_updated'" class="space-y-3">
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
        <p class="text-xs text-white/50 mt-1">
          Trouvez l'ID dans l'URL Spotify
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
           Se déclenche quand la playlist est modifiée (ajout/suppression de pistes)
        </p>
      </div>
    </div>

    <!-- Unknown action -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        ⚠️ Action inconnue: {{ actionType }}
      </p>
    </div>

    <!-- Helper: How to find IDs -->
    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span> Comment trouver les IDs Spotify ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Playlist ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez Spotify et allez sur une playlist</li>
          <li>Cliquez sur les 3 points → Partager → Copier le lien</li>
          <li>URL: https://open.spotify.com/playlist/<strong class="text-blue-300">37i9dQZF1DX...</strong></li>
          <li>L'ID est la partie après /playlist/</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Track ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Clic droit sur une chanson → Partager → Copier le lien</li>
          <li>URL: https://open.spotify.com/track/<strong class="text-blue-300">11dFghVXAN...</strong></li>
          <li>L'ID est la partie après /track/</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  actionType: {
    type: String,
    required: true,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:config']);

const localConfig = ref({ ...props.config });
const showHelp = ref(false);

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });
</script>
