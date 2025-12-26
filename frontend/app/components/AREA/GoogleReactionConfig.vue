<!-- components/AREA/GoogleReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- google_send_email -->
    <div v-if="reactionType === 'google_send_email'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Destinataire <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.to"
          type="email"
          placeholder="destinataire@exemple.com"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Adresse email du destinataire
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Sujet <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.subject"
          type="text"
          placeholder="Notification AREA"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Sujet de l'email à envoyer
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.body"
          rows="4"
          placeholder="Votre message ici..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Contenu du message à envoyer
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <input
          v-model="localConfig.html"
          type="checkbox"
          id="html-checkbox"
          class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
          @change="emit('update:config', localConfig)"
        />
        <label for="html-checkbox" class="text-sm text-white">
          Format HTML
        </label>
      </div>

      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          Envoie un email via votre compte Gmail
        </p>
      </div>
    </div>

    <!-- google_reply_to_email -->
    <div v-else-if="reactionType === 'google_reply_to_email'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Message de réponse <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.body"
          rows="4"
          placeholder="Merci pour votre email..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          La réponse sera envoyée à l'expéditeur de l'email déclencheur
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <input
          v-model="localConfig.replyAll"
          type="checkbox"
          id="reply-all-checkbox"
          class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
          @change="emit('update:config', localConfig)"
        />
        <label for="reply-all-checkbox" class="text-sm text-white">
          Répondre à tous
        </label>
      </div>

      <div class="flex items-center space-x-2">
        <input
          v-model="localConfig.includeOriginal"
          type="checkbox"
          id="include-original-checkbox"
          class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
          @change="emit('update:config', localConfig)"
        />
        <label for="include-original-checkbox" class="text-sm text-white">
          Inclure le message original
        </label>
      </div>

      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          Répond automatiquement à l'email qui a déclenché l'action
        </p>
      </div>
    </div>

    <!-- google_save_attachment_to_drive -->
    <div v-else-if="reactionType === 'google_save_attachment_to_drive'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Dossier Drive ID (optionnel)
        </label>
        <input
          v-model="localConfig.folderId"
          type="text"
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour sauvegarder à la racine de Drive
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Types de fichiers à sauvegarder (optionnel)
        </label>
        <input
          v-model="fileTypesInput"
          type="text"
          placeholder="pdf, docx, xlsx"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateFileTypes"
        />
        <p class="text-xs text-white/50 mt-1">
          Séparez les extensions par des virgules. Laissez vide pour tous les types
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Pattern de renommage (optionnel)
        </label>
        <input
          v-model="localConfig.renamePattern"
          type="text"
          placeholder="backup_{{filename}}"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Pattern de renommage des fichiers (optionnel)
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <input
          v-model="localConfig.overwrite"
          type="checkbox"
          id="overwrite-checkbox"
          class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
          @change="emit('update:config', localConfig)"
        />
        <label for="overwrite-checkbox" class="text-sm text-white">
          Écraser les fichiers existants
        </label>
      </div>

      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          Sauvegarde automatiquement les pièces jointes dans Google Drive
        </p>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        Réaction inconnue: {{ reactionType }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  reactionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'update:config', config: Record<string, any>): void;
}>();

const localConfig = ref<Record<string, any>>({ ...props.config });
const fileTypesInput = ref('');

// Initialize file types input
if (props.reactionType === 'google_save_attachment_to_drive' && localConfig.value.fileTypes) {
  fileTypesInput.value = Array.isArray(localConfig.value.fileTypes)
    ? localConfig.value.fileTypes.join(', ')
    : '';
}

// Initialize checkboxes with default values
if (props.reactionType === 'google_reply_to_email') {
  if (localConfig.value.includeOriginal === undefined) {
    localConfig.value.includeOriginal = true;
  }
  if (localConfig.value.replyAll === undefined) {
    localConfig.value.replyAll = false;
  }
}

if (props.reactionType === 'google_save_attachment_to_drive') {
  if (localConfig.value.overwrite === undefined) {
    localConfig.value.overwrite = false;
  }
}

const updateFileTypes = () => {
  if (fileTypesInput.value) {
    localConfig.value.fileTypes = fileTypesInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  } else {
    localConfig.value.fileTypes = undefined;
  }
  emit('update:config', localConfig.value);
};

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });
</script>
