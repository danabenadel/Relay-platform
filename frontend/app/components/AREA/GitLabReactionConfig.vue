<!-- components/AREA/GitLabReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- create_issue -->
    <div v-if="reactionType === 'create_issue'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Project ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.projectId"
          type="text"
          placeholder="12345 ou group/project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue Title <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.title"
          type="text"
          placeholder="New issue from AREA"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue Description (optionnel)
        </label>
        <textarea
          v-model="localConfig.description"
          rows="3"
          placeholder="Description de l'issue..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Labels (optionnel)
        </label>
        <input
          v-model="localConfig.labels"
          type="text"
          placeholder="bug,enhancement"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Séparez les labels par des virgules
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Assignee IDs (optionnel)
        </label>
        <input
          v-model="localConfig.assigneeIds"
          type="text"
          placeholder="123,456"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          IDs des utilisateurs à assigner (séparés par des virgules)
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✨ Crée une nouvelle issue dans le projet spécifié
        </p>
      </div>
    </div>

    <!-- comment_merge_request -->
    <div v-else-if="reactionType === 'comment_merge_request'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Project ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.projectId"
          type="text"
          placeholder="12345 ou group/project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Merge Request IID <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.mergeRequestIid"
          type="number"
          placeholder="42"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          L'IID (Internal ID) de la merge request
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Comment Body <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.body"
          rows="3"
          placeholder="Votre commentaire ici..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          💬 Ajoute un commentaire à une merge request existante
        </p>
      </div>
    </div>

    <!-- add_label -->
    <div v-else-if="reactionType === 'add_label'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Project ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.projectId"
          type="text"
          placeholder="12345 ou group/project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue IID <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.issueIid"
          type="number"
          placeholder="42"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          L'IID (Internal ID) de l'issue
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Labels <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.labels"
          type="text"
          placeholder="bug,enhancement,help wanted"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Séparez les labels par des virgules
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          🏷️ Ajoute des labels à une issue
        </p>
      </div>
    </div>

    <!-- close_issue -->
    <div v-else-if="reactionType === 'close_issue'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Project ID <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.projectId"
          type="text"
          placeholder="12345 ou group/project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue IID <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.issueIid"
          type="number"
          placeholder="42"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          ❌ Ferme l'issue spécifiée
        </p>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        Réaction non reconnue : {{ reactionType }}
      </p>
    </div>

    <!-- Help Section -->
    <div class="mt-6 pt-6 border-t border-white/10">
      <h4 class="text-sm font-medium text-white mb-2 flex items-center">
        <Icon name="mdi:help-circle-outline" class="w-4 h-4 mr-2" />
        Aide
      </h4>
      <div class="space-y-2 text-xs text-white/70">
        <p>
          Les réactions GitLab interagissent avec vos projets via l'API GitLab.
        </p>
        <p>
          ✅ Assurez-vous que votre compte GitLab a les permissions nécessaires pour effectuer ces actions.
        </p>
        <p class="text-yellow-300 mt-3">
          💡 Pour créer des issues, commentaires ou MR, vous devez avoir les droits d'écriture sur le projet.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  reactionType: string
  config: Record<string, any>
}>()

const emit = defineEmits<{
  'update:config': [config: Record<string, any>]
}>()

const localConfig = ref({ ...props.config })

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })
</script>
