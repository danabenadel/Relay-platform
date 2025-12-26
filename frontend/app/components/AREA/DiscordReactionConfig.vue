<!-- components/AREA/DiscordReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- send_message -->
    <div v-if="reactionType === 'send_message'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Clic droit sur un channel → Copier l'identifiant
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.messageContent"
          placeholder="Votre message ici..."
          rows="3"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          💬 Envoie un message texte dans le channel Discord spécifié
        </p>
      </div>
    </div>

    <!-- send_embed -->
    <div v-else-if="reactionType === 'send_embed'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Titre de l'embed <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.embedTitle"
          type="text"
          placeholder="Titre de notification"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          v-model="localConfig.embedDescription"
          placeholder="Description détaillée..."
          rows="2"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Couleur (décimal)
        </label>
        <div class="flex space-x-2">
          <input
            v-model.number="localConfig.embedColor"
            type="number"
            placeholder="3447003"
            class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            @input="emit('update:config', localConfig)"
          />
          <div
            class="w-12 h-10 rounded border border-white/20"
            :style="{ backgroundColor: embedColorPreview }"
          ></div>
        </div>
        <p class="text-xs text-white/50 mt-1">
          Ex: 3447003 (bleu), 15844367 (or), 15158332 (rouge)
        </p>
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          ✨ Envoie un message embed enrichi (avec couleur et formatage)
        </p>
      </div>
    </div>

    <!-- send_dm -->
    <div v-else-if="reactionType === 'send_dm'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          User ID du destinataire <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.targetUserId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Clic droit sur un utilisateur → Copier l'identifiant
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message privé <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.messageContent"
          placeholder="Votre message privé..."
          rows="3"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          📨 Envoie un message privé (DM) à un utilisateur Discord
        </p>
      </div>
    </div>

    <!-- add_reaction -->
    <div v-else-if="reactionType === 'add_reaction'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.messageId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Emoji <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.emoji"
          type="text"
          placeholder="👍"
          maxlength="10"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Utilisez un emoji Unicode (ex: 👍, ❤️, 🎉)
        </p>
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          👍 Ajoute une réaction emoji à un message Discord
        </p>
      </div>
    </div>

    <!-- delete_message -->
    <div v-else-if="reactionType === 'delete_message'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message ID à supprimer <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.messageId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Clic droit sur un message → Copier l'identifiant du message
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          🗑️ Supprime un message Discord (nécessite les permissions appropriées)
        </p>
      </div>
    </div>

    <!-- pin_message -->
    <div v-else-if="reactionType === 'pin_message'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message ID à épingler <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.messageId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          📌 Épingle un message dans le channel (nécessite les permissions appropriées)
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
        <span>💡 Comment trouver les IDs Discord ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Activer le Mode Développeur:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Discord → Paramètres Utilisateur → Avancés</li>
          <li>Activez le "Mode développeur"</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Channel/Message/User ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Clic droit sur l'élément concerné</li>
          <li>Sélectionnez "Copier l'identifiant"</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Couleurs d'embed courantes:</strong></p>
        <ul class="list-disc list-inside space-y-1 ml-2">
          <li>Bleu: 3447003</li>
          <li>Or: 15844367</li>
          <li>Rouge: 15158332</li>
          <li>Vert: 5763719</li>
          <li>Violet: 10181046</li>
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

// Computed property for embed color preview
const embedColorPreview = computed(() => {
  const color = localConfig.value.embedColor || 3447003;
  // Convert decimal to hex color
  return '#' + color.toString(16).padStart(6, '0');
});

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });
</script>
