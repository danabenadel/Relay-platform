<template>
  <div class="space-y-4">
    <div v-if="reactionType === 'youtube_post_comment'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Video ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.videoId"
          type="text"
          placeholder="dQw4w9WgXcQ"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          L'ID de la vidéo sur laquelle commenter
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Commentaire <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.comment"
          placeholder="Votre commentaire..."
          rows="3"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Poste un commentaire sur une vidéo YouTube
        </p>
      </div>
    </div>

    <div v-else-if="reactionType === 'youtube_like_video'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Video ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.videoId"
          type="text"
          placeholder="dQw4w9WgXcQ"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Trouvez l'ID dans l'URL YouTube: youtube.com/watch?v=<strong>ID</strong>
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Like automatiquement une vidéo YouTube
        </p>
      </div>
    </div>

    <div v-else-if="reactionType === 'youtube_add_to_playlist'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Playlist ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.playlistId"
          type="text"
          placeholder="PLxxxxxx..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          L'ID de la playlist où ajouter la vidéo
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Video ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.videoId"
          type="text"
          placeholder="dQw4w9WgXcQ"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Ajoute une vidéo à une playlist existante
        </p>
      </div>
    </div>

    <div v-else-if="reactionType === 'youtube_create_playlist'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Nom de la playlist <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.playlistName"
          type="text"
          placeholder="Ma nouvelle playlist"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          v-model="localConfig.playlistDescription"
          placeholder="Description de la playlist..."
          rows="2"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Visibilité
        </label>
        <select
          v-model="localConfig.privacyStatus"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          @change="emit('update:config', localConfig)"
        >
          <option value="private">Privée</option>
          <option value="public">Publique</option>
          <option value="unlisted">Non répertoriée</option>
        </select>
        <p class="text-xs text-white/50 mt-1">
          Par défaut: Privée
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Crée une nouvelle playlist YouTube
        </p>
      </div>
    </div>

    <div v-else-if="reactionType === 'youtube_subscribe_channel'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="UCxxxxxx..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          L'ID de la chaîne à laquelle s'abonner
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          S'abonne automatiquement à une chaîne YouTube
        </p>
      </div>
    </div>

    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        Reaction inconnue: {{ reactionType }}
      </p>
    </div>

    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span>Comment trouver les IDs YouTube ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Video ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez une vidéo YouTube</li>
          <li>URL: https://youtube.com/watch?v=<strong class="text-red-300">dQw4w9WgXcQ</strong></li>
          <li>L'ID est la partie après v=</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Playlist ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez une playlist YouTube</li>
          <li>URL: https://youtube.com/playlist?list=<strong class="text-red-300">PLxxxxxx...</strong></li>
          <li>L'ID est la partie après list=</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Channel ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Allez sur une chaîne YouTube</li>
          <li>URL: https://youtube.com/channel/<strong class="text-red-300">UCxxxxxx...</strong></li>
          <li>Ou clic droit → Inspecter → Recherchez "channelId"</li>
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

const localConfig = ref({ ...props.config });
const showHelp = ref(false);

// Backward compatibility for older configs using commentText
if (localConfig.value.commentText) {
  if (!localConfig.value.comment) {
    localConfig.value.comment = localConfig.value.commentText;
  }
  delete localConfig.value.commentText;
}

// Set default privacy status
if (!localConfig.value.privacyStatus) {
  localConfig.value.privacyStatus = 'private';
}

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
  if (localConfig.value.commentText) {
    if (!localConfig.value.comment) {
      localConfig.value.comment = localConfig.value.commentText;
    }
    delete localConfig.value.commentText;
  }
}, { deep: true });
</script>
