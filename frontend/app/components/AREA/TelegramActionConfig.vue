<!-- components/AREA/TelegramActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- new_message -->
    <div v-if="actionType === 'new_message'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Chat ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.chat_id"
          type="text"
          placeholder="-1001234567890"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
        <p class="text-xs text-white/50 mt-1">
          Identifiant du chat ou du canal (les groupes commencent par -100)
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <input
          v-model="localConfig.only_text"
          type="checkbox"
          id="telegram-only-text"
          class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-white/30 rounded bg-white/10"
          @change="emitUpdate"
        />
        <label for="telegram-only-text" class="text-sm text-white">
          Déclencher uniquement sur les messages texte
        </label>
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          💬 Surveille un chat précis et déclenche l'action lorsqu'un nouveau message arrive
        </p>
      </div>
    </div>

    <!-- new_member -->
    <div v-else-if="actionType === 'new_member'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Chat ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.chat_id"
          type="text"
          placeholder="-1001234567890"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          👥 Déclenchement lorsqu'un nouveau membre rejoint le groupe surveillé
        </p>
      </div>
    </div>

    <!-- bot_command -->
    <div v-else-if="actionType === 'bot_command'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Commande à écouter
        </label>
        <input
          v-model="localConfig.command"
          type="text"
          placeholder="start"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
        <p class="text-xs text-white/50 mt-1">
          Indiquez la commande sans le / (ex: start). Laissez vide pour détecter toutes les commandes
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Chat ID (optionnel)
        </label>
        <input
          v-model="localConfig.chat_id"
          type="text"
          placeholder="Limite la commande à un chat spécifique"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          🤖 Détecte lorsqu'un utilisateur envoie une commande à votre bot
        </p>
      </div>
    </div>

    <!-- channel_post -->
    <div v-else-if="actionType === 'channel_post'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.channel_id"
          type="text"
          placeholder="@mon_channel"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
        <p class="text-xs text-white/50 mt-1">
          Utilisez l'ID numérique ou le @username du canal à surveiller
        </p>
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          📢 Détecte les nouvelles publications dans un canal
        </p>
      </div>
    </div>

    <!-- poll_created -->
    <div v-else-if="actionType === 'poll_created'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Chat ID (optionnel)
        </label>
        <input
          v-model="localConfig.chat_id"
          type="text"
          placeholder="Définissez un chat spécifique ou laissez vide"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          📊 Déclenchement à la création d'un nouveau sondage
        </p>
      </div>
    </div>

    <!-- Unknown action -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        ⚠️ Action Telegram inconnue: {{ actionType }}
      </p>
    </div>

    <!-- Helper -->
    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span>💡 Comment récupérer un chat ID Telegram ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Depuis Telegram:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Démarrez une discussion avec <span class="text-white/80">@RawDataBot</span></li>
          <li>Transférez un message du chat à identifier</li>
          <li>Copiez la valeur <span class="text-white/80">chat_id</span> affichée</li>
        </ol>
        <p class="mt-3">
          Pour les groupes privés, l'ID commence généralement par <code class="text-sky-200">-100</code>.
        </p>
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

const buildConfig = (source = {}) => {
  switch (props.actionType) {
    case 'new_message':
      return {
        chat_id: '',
        only_text: false,
        ...source,
      };
    case 'new_member':
      return {
        chat_id: '',
        ...source,
      };
    case 'bot_command':
      return {
        command: '',
        chat_id: '',
        ...source,
      };
    case 'channel_post':
      return {
        channel_id: '',
        ...source,
      };
    case 'poll_created':
      return {
        chat_id: '',
        ...source,
      };
    default:
      return { ...source };
  }
};

const localConfig = ref(buildConfig(props.config));
const showHelp = ref(false);

const emitUpdate = () => {
  emit('update:config', { ...localConfig.value });
};

watch(() => props.actionType, () => {
  localConfig.value = buildConfig();
  emitUpdate();
});

watch(() => props.config, (newConfig) => {
  localConfig.value = buildConfig(newConfig || {});
}, { deep: true });

onMounted(() => {
  emitUpdate();
});
</script>
