<!-- components/AREA/GitHubReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- create_issue -->
    <div v-if="reactionType === 'create_issue'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Owner <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.owner"
          type="text"
          placeholder="octocat"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.repo"
          type="text"
          placeholder="my-project"
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
          Issue Body (optionnel)
        </label>
        <textarea
          v-model="localConfig.body"
          rows="3"
          placeholder="Issue description..."
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
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
           Crée une nouvelle issue dans le repository spécifié
        </p>
      </div>
    </div>

    <!-- create_comment -->
    <div v-else-if="reactionType === 'create_comment'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Owner <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.owner"
          type="text"
          placeholder="octocat"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.repo"
          type="text"
          placeholder="my-project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue/PR Number <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.issueNumber"
          type="number"
          placeholder="42"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Le numéro de l'issue ou de la pull request
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Comment Body <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.body"
          rows="3"
          placeholder="Your comment here..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
           Ajoute un commentaire à une issue ou pull request existante
        </p>
      </div>
    </div>

    <!-- star_repository -->
    <div v-else-if="reactionType === 'star_repository'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Owner <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.owner"
          type="text"
          placeholder="octocat"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.repo"
          type="text"
          placeholder="my-project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p class="text-sm text-yellow-300">
           Ajoute une star au repository spécifié
        </p>
      </div>
    </div>

    <!-- create_branch -->
    <div v-else-if="reactionType === 'create_branch'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Owner <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.owner"
          type="text"
          placeholder="octocat"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.repo"
          type="text"
          placeholder="my-project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          New Branch Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.branchName"
          type="text"
          placeholder="feature/new-feature"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Source Branch (optionnel)
        </label>
        <input
          v-model="localConfig.fromBranch"
          type="text"
          placeholder="main"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          La branche source pour créer la nouvelle branche (défaut: main)
        </p>
      </div>
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
           Crée une nouvelle branche dans le repository
        </p>
      </div>
    </div>

    <!-- close_issue -->
    <div v-else-if="reactionType === 'close_issue'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Owner <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.owner"
          type="text"
          placeholder="octocat"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.repo"
          type="text"
          placeholder="my-project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue Number <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.issueNumber"
          type="number"
          placeholder="42"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
           Ferme l'issue spécifiée
        </p>
      </div>
    </div>

    <!-- add_label -->
    <div v-else-if="reactionType === 'add_label'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Owner <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.owner"
          type="text"
          placeholder="octocat"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Repository Name <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.repo"
          type="text"
          placeholder="my-project"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Issue/PR Number <span class="text-red-400">*</span>
        </label>
        <input
          v-model.number="localConfig.issueNumber"
          type="number"
          placeholder="42"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
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
           Ajoute des labels à une issue ou pull request
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
          Les réactions GitHub interagissent avec vos repositories via l'API GitHub.
        </p>
        <p>
           Assurez-vous que votre compte GitHub a les permissions nécessaires pour effectuer ces actions.
        </p>
        <p class="text-yellow-300 mt-3">
           Pour créer des issues, commentaires ou branches, vous devez avoir les droits d'écriture sur le repository.
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
