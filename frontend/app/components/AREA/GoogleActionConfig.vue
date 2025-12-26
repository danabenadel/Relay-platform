<!-- components/AREA/GoogleActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- google_new_email_received -->
    <div v-if="actionType === 'google_new_email_received'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Gmail Query (optionnel)
        </label>
        <input
          v-model="localConfig.query"
          type="text"
          placeholder="is:unread"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Exemples: "is:unread", "from:exemple@gmail.com", "has:attachment"
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          Se déclenche quand un nouvel email arrive dans votre boîte Gmail
        </p>
      </div>
    </div>

    <!-- google_email_from_sender -->
    <div v-else-if="actionType === 'google_email_from_sender'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Adresses Email <span class="text-red-400">*</span>
        </label>
        <input
          v-model="sendersInput"
          type="text"
          placeholder="boss@company.com, @clients.com"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateSenders"
        />
        <p class="text-xs text-white/50 mt-1">
          Séparez les emails par des virgules. Utilisez @domain.com pour filtrer par domaine
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Type de correspondance
        </label>
        <select
          v-model="localConfig.matchType"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="emit('update:config', localConfig)"
        >
          <option value="exact">Exacte</option>
          <option value="domain">Par domaine</option>
          <option value="contains">Contient</option>
        </select>
      </div>

      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          Se déclenche pour les emails provenant d'expéditeurs spécifiques
        </p>
      </div>
    </div>

    <!-- google_email_with_attachment -->
    <div v-else-if="actionType === 'google_email_with_attachment'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Types de fichiers (optionnel)
        </label>
        <input
          v-model="fileTypesInput"
          type="text"
          placeholder="pdf, docx, xlsx"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateFileTypes"
        />
        <p class="text-xs text-white/50 mt-1">
          Séparez les extensions par des virgules (sans point)
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Expéditeur (optionnel)
        </label>
        <input
          v-model="localConfig.from"
          type="text"
          placeholder="comptabilite@entreprise.com"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          Se déclenche pour les emails contenant des pièces jointes
        </p>
      </div>
    </div>

    <!-- google_new_drive_file -->
    <div v-else-if="actionType === 'google_new_drive_file'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Folder ID (optionnel)
        </label>
        <input
          v-model="localConfig.folderId"
          type="text"
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour surveiller tous les dossiers
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Types MIME (optionnel)
        </label>
        <input
          v-model="fileTypesInput"
          type="text"
          placeholder="application/pdf, image/jpeg"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateDriveFileTypes"
        />
        <p class="text-xs text-white/50 mt-1">
          Séparez les types MIME par des virgules
        </p>
      </div>

      <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p class="text-sm text-yellow-300">
          Se déclenche quand un nouveau fichier est créé dans Google Drive
        </p>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        Action inconnue: {{ actionType }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  actionType: string;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'update:config', config: Record<string, any>): void;
}>();

const localConfig = ref<Record<string, any>>({ ...props.config });
const sendersInput = ref('');
const fileTypesInput = ref('');

// Initialize senders input
if (props.actionType === 'google_email_from_sender' && localConfig.value.senders) {
  sendersInput.value = Array.isArray(localConfig.value.senders)
    ? localConfig.value.senders.join(', ')
    : '';
}

// Initialize file types input for email attachments
if (props.actionType === 'google_email_with_attachment' && localConfig.value.fileTypes) {
  fileTypesInput.value = Array.isArray(localConfig.value.fileTypes)
    ? localConfig.value.fileTypes.join(', ')
    : '';
}

// Initialize file types input for Drive
if (props.actionType === 'google_new_drive_file' && localConfig.value.fileTypes) {
  fileTypesInput.value = Array.isArray(localConfig.value.fileTypes)
    ? localConfig.value.fileTypes.join(', ')
    : '';
}

const updateSenders = () => {
  if (sendersInput.value) {
    localConfig.value.senders = sendersInput.value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } else {
    localConfig.value.senders = [];
  }
  emit('update:config', localConfig.value);
};

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

const updateDriveFileTypes = () => {
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
