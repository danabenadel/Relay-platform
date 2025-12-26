<!-- components/AREA/RedditReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- submit_post -->
    <div v-if="reactionType === 'submit_post'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Subreddit <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subreddit"
          type="text"
          placeholder="test"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="updateBoth"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Titre du post <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.title"
          type="text"
          placeholder="Mon titre de post"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Contenu (texte)
        </label>
        <textarea
          v-model="localConfig.text"
          placeholder="Le contenu de votre post..."
          rows="4"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          📝 Crée un nouveau post dans r/{{ localConfig.subreddit || localConfig.targetSubreddit || 'subreddit' }}
        </p>
      </div>
    </div>

    <!-- submit_comment -->
    <div v-else-if="reactionType === 'submit_comment'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Post ID (optionnel)
        </label>
        <input
          v-model="localConfig.thingId"
          type="text"
          placeholder="t3_abc123"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour commenter le post détecté par l'action
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Commentaire <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.text"
          placeholder="Votre commentaire..."
          rows="3"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          💬 Poste un commentaire
        </p>
      </div>
    </div>

    <!-- upvote -->
    <div v-else-if="reactionType === 'upvote'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Thing ID (optionnel)
        </label>
        <input
          v-model="localConfig.thingId"
          type="text"
          placeholder="t3_abc123"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Format: t3_postid ou t1_commentid. Laissez vide pour upvoter l'élément détecté
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          👍 Upvote un post ou commentaire
        </p>
      </div>
    </div>

    <!-- save_post -->
    <div v-else-if="reactionType === 'save_post'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Thing ID (optionnel)
        </label>
        <input
          v-model="localConfig.thingId"
          type="text"
          placeholder="t3_abc123"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour sauvegarder le post détecté
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          🔖 Sauvegarde un post dans vos favoris
        </p>
      </div>
    </div>

    <!-- subscribe_subreddit -->
    <div v-else-if="reactionType === 'subscribe_subreddit'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Subreddit <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subreddit"
          type="text"
          placeholder="programming"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ➕ S'abonne à r/{{ localConfig.subreddit || 'subreddit' }}
        </p>
      </div>
    </div>

    <!-- unsubscribe_subreddit -->
    <div v-else-if="reactionType === 'unsubscribe_subreddit'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Subreddit <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subreddit"
          type="text"
          placeholder="programming"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ➖ Se désabonne de r/{{ localConfig.subreddit || 'subreddit' }}
        </p>
      </div>
    </div>

    <!-- send_message -->
    <div v-else-if="reactionType === 'send_message'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Destinataire (username) <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.to"
          type="text"
          placeholder="reddit_user"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Sujet <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subject"
          type="text"
          placeholder="Message via AREA"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.text"
          placeholder="Votre message..."
          rows="3"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✉️ Envoie un message privé à u/{{ localConfig.to || 'user' }}
        </p>
      </div>
    </div>

    <!-- Unknown reaction -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        ⚠️ Réaction inconnue: {{ reactionType }}
      </p>
    </div>

    <!-- Helper -->
    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span>❓ Aide Reddit</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Thing ID:</strong></p>
        <ul class="list-disc list-inside space-y-1 ml-2">
          <li><strong>t3_</strong> = Post (ex: t3_abc123)</li>
          <li><strong>t1_</strong> = Commentaire (ex: t1_xyz789)</li>
          <li>Trouvable dans les URLs Reddit</li>
        </ul>
        <p class="mt-2"><strong class="text-white/80">Variables dynamiques:</strong></p>
        <ul class="list-disc list-inside space-y-1 ml-2">
          <li>Laissez les champs vides pour utiliser les données de l'action</li>
          <li>Exemple: upvote automatique du post détecté</li>
        </ul>
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

// Helper function to update both subreddit and targetSubreddit for backward compatibility
const updateBoth = () => {
  if (localConfig.value.subreddit) {
    localConfig.value.targetSubreddit = localConfig.value.subreddit;
  }
  emit('update:config', localConfig.value);
};

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
  // Sync subreddit fields if one is set
  if (newConfig.targetSubreddit && !newConfig.subreddit) {
    localConfig.value.subreddit = newConfig.targetSubreddit;
  } else if (newConfig.subreddit && !newConfig.targetSubreddit) {
    localConfig.value.targetSubreddit = newConfig.subreddit;
  }
}, { deep: true });
</script>
