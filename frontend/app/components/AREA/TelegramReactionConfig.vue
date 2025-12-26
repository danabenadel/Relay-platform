<!-- components/AREA/TelegramReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- send_message -->
    <div v-if="reactionType === 'send_message'" class="space-y-3">
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
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.message"
          rows="3"
          placeholder="Nouvelle notification AREA"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Parse mode
        </label>
        <select
          v-model="localConfig.parse_mode"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          @change="emitUpdate"
        >
          <option value="">Aucun</option>
          <option value="MarkdownV2">MarkdownV2</option>
          <option value="HTML">HTML</option>
        </select>
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          ✉️ Envoie un message texte au chat ciblé. Utilisez les variables d'action comme
          <code v-pre>{{payload.message}}</code>.
        </p>
      </div>
    </div>

    <!-- send_photo -->
    <div v-else-if="reactionType === 'send_photo'" class="space-y-3">
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
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          URL de la photo <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.photo_url"
          type="text"
          placeholder="https://..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Légende
        </label>
        <input
          v-model="localConfig.caption"
          type="text"
          placeholder="Texte optionnel sous la photo"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          📷 Publie une image dans le chat avec une légende facultative
        </p>
      </div>
    </div>

    <!-- send_document -->
    <div v-else-if="reactionType === 'send_document'" class="space-y-3">
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
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          URL du document <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.document_url"
          type="text"
          placeholder="https://..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Légende
        </label>
        <input
          v-model="localConfig.caption"
          type="text"
          placeholder="Texte optionnel"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          📄 Partage un fichier dans le chat
        </p>
      </div>
    </div>

    <!-- create_poll -->
    <div v-else-if="reactionType === 'create_poll'" class="space-y-3">
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
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Question <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.question"
          type="text"
          placeholder="Quel est votre choix ?"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Options (séparées par des virgules) <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.options"
          rows="2"
          placeholder="Option 1,Option 2,Option 3"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          🗳️ Crée un sondage interactif dans le chat ciblé
        </p>
      </div>
    </div>

    <!-- pin_message -->
    <div v-else-if="reactionType === 'pin_message'" class="space-y-3">
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
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.message_id"
          type="text"
          placeholder="123456"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          📌 Epingle un message important dans un chat
        </p>
      </div>
    </div>

    <!-- kick_user -->
    <div v-else-if="reactionType === 'kick_user'" class="space-y-3">
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
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          User ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.user_id"
          type="text"
          placeholder="123456789"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Timestamp de fin de bannissement (Unix) (optionnel)
        </label>
        <input
          v-model.number="localConfig.until_date"
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500"
          @input="emitUpdate"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour un bannissement permanent
        </p>
      </div>
      <div class="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
        <p class="text-sm text-sky-200">
          🚫 Retire un utilisateur du groupe ciblé
        </p>
      </div>
    </div>

    <!-- Unknown reaction -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        ⚠️ Réaction Telegram inconnue: {{ reactionType }}
      </p>
    </div>

    <!-- Helper -->
    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span>💡 Où trouver les identifiants Telegram ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">chat_id :</strong> Utilisez <span class="text-white/80">@RawDataBot</span> ou <span class="text-white/80">@userinfobot</span>.</p>
        <p><strong class="text-white/80">user_id :</strong> Écrivez à <span class="text-white/80">@userinfobot</span> depuis l'utilisateur concerné.</p>
        <p><strong class="text-white/80">message_id :</strong> Touchez et maintenez un message → Copier le lien → récupérez l'ID à la fin.</p>
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

const buildConfig = (source = {}) => {
  switch (props.reactionType) {
    case 'send_message':
      return {
        chat_id: '',
        message: 'Nouvelle notification AREA',
        parse_mode: '',
        ...source,
      };
    case 'send_photo':
      return {
        chat_id: '',
        photo_url: '',
        caption: '',
        ...source,
      };
    case 'send_document':
      return {
        chat_id: '',
        document_url: '',
        caption: '',
        ...source,
      };
    case 'create_poll':
      return {
        chat_id: '',
        question: '',
        options: 'Option 1,Option 2',
        ...source,
      };
    case 'pin_message':
      return {
        chat_id: '',
        message_id: '',
        ...source,
      };
    case 'kick_user':
      return {
        chat_id: '',
        user_id: '',
        until_date: null,
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

watch(() => props.reactionType, () => {
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
