<!-- components/AREA/RedditActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- new_post_in_subreddit -->
    <div v-if="actionType === 'new_post_in_subreddit'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Subreddit <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subreddit"
          type="text"
          placeholder="programming"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="updateBoth"
        />
        <p class="text-xs text-white/50 mt-1">
          Nom du subreddit sans le r/ (ex: programming, gaming)
        </p>
      </div>
      <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <p class="text-sm text-orange-300">
          🔔 Se déclenche quand un nouveau post est publié dans r/{{ localConfig.subreddit || 'subreddit' }}
        </p>
      </div>
    </div>

    <!-- new_comment_on_post -->
    <div v-else-if="actionType === 'new_comment_on_post'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Post ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.postId"
          type="text"
          placeholder="abc123"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          L'ID du post (trouvable dans l'URL Reddit)
        </p>
      </div>
      <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <p class="text-sm text-orange-300">
          💬 Se déclenche quand un nouveau commentaire est ajouté au post
        </p>
      </div>
    </div>

    <!-- new_message -->
    <div v-else-if="actionType === 'new_message'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✅ Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          Cette action se déclenche automatiquement quand vous recevez un message privé
        </p>
      </div>
    </div>

    <!-- post_score_threshold -->
    <div v-else-if="actionType === 'post_score_threshold'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Post ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.postId"
          type="text"
          placeholder="abc123"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Seuil de score <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.threshold"
          type="number"
          placeholder="100"
          min="1"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Nombre d'upvotes minimum (karma)
        </p>
      </div>
      <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <p class="text-sm text-orange-300">
          📊 Se déclenche quand le post atteint {{ localConfig.threshold || 'X' }} upvotes
        </p>
      </div>
    </div>

    <!-- new_subscriber_milestone -->
    <div v-else-if="actionType === 'new_subscriber_milestone'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Subreddit <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subreddit"
          type="text"
          placeholder="mysubreddit"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Jalon d'abonnés <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.milestone"
          type="number"
          placeholder="1000"
          min="1"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Nombre d'abonnés à atteindre (ex: 1000, 10000)
        </p>
      </div>
      <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <p class="text-sm text-orange-300">
          🎉 Se déclenche quand r/{{ localConfig.subreddit || 'subreddit' }} atteint {{ localConfig.milestone || 'X' }} abonnés
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
        <span>❓ Comment trouver les informations Reddit ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Nom du subreddit:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Allez sur Reddit et trouvez un subreddit</li>
          <li>URL: reddit.com/r/<strong class="text-orange-300">programming</strong></li>
          <li>Utilisez uniquement le nom sans le r/</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Post ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez un post Reddit</li>
          <li>URL: reddit.com/r/programming/comments/<strong class="text-orange-300">abc123</strong>/titre</li>
          <li>L'ID est la partie après /comments/</li>
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

// Helper function to update both subreddit and watchSubreddit for backward compatibility
const updateBoth = () => {
  if (localConfig.value.subreddit) {
    localConfig.value.watchSubreddit = localConfig.value.subreddit;
  }
  emit('update:config', localConfig.value);
};

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
  // Sync subreddit fields if one is set
  if (newConfig.watchSubreddit && !newConfig.subreddit) {
    localConfig.value.subreddit = newConfig.watchSubreddit;
  } else if (newConfig.subreddit && !newConfig.watchSubreddit) {
    localConfig.value.watchSubreddit = newConfig.subreddit;
  }
}, { deep: true });
</script>
