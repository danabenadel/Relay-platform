<!-- components/AREA/DiscordActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- new_message_in_channel -->
    <div v-if="actionType === 'new_message_in_channel'" class="space-y-3">
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
          Clic droit sur un channel Discord → Copier l'identifiant
        </p>
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          ℹ️ Cette action se déclenche quand un nouveau message est posté dans le channel
        </p>
      </div>
    </div>

    <!-- new_member_joined -->
    <div v-else-if="actionType === 'new_member_joined'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Server (Guild) ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.guildId"
          type="text"
          placeholder="1234567890123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Paramètres du serveur → ID du serveur (widget)
        </p>
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          ℹ️ Se déclenche quand un nouveau membre rejoint le serveur Discord
        </p>
      </div>
    </div>

    <!-- message_reaction_added -->
    <div v-else-if="actionType === 'message_reaction_added'" class="space-y-3">
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
          Message ID <span class="text-red-400">*</span>
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
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          ℹ️ Se déclenche quand une réaction est ajoutée au message spécifié
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
        <span>💡 Comment trouver les IDs Discord ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Activer le Mode Développeur:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez Discord → Paramètres Utilisateur</li>
          <li>Allez dans Avancés</li>
          <li>Activez le "Mode développeur"</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Channel ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Clic droit sur un channel</li>
          <li>Cliquez sur "Copier l'identifiant"</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Server (Guild) ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Clic droit sur l'icône du serveur</li>
          <li>Cliquez sur "Copier l'identifiant du serveur"</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Message ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Clic droit sur un message</li>
          <li>Cliquez sur "Copier l'identifiant du message"</li>
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
