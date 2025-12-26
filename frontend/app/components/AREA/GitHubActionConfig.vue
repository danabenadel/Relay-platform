<!-- components/AREA/GitHubActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- new_issue -->
    <div v-if="actionType === 'new_issue'" class="space-y-3">
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
        <p class="text-xs text-white/50 mt-1">
          Le nom d'utilisateur ou de l'organisation propriétaire du repository
        </p>
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
        <p class="text-xs text-white/50 mt-1">
          Le nom du repository à surveiller
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          ✨ Cette action se déclenche quand une nouvelle issue est créée dans le repository
        </p>
      </div>
    </div>

    <!-- new_pull_request -->
    <div v-else-if="actionType === 'new_pull_request'" class="space-y-3">
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
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
           Se déclenche quand une nouvelle pull request est ouverte
        </p>
      </div>
    </div>

    <!-- pull_request_merged -->
    <div v-else-if="actionType === 'pull_request_merged'" class="space-y-3">
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
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
           Se déclenche quand une pull request est mergée dans le repository
        </p>
      </div>
    </div>

    <!-- new_star -->
    <div v-else-if="actionType === 'new_star'" class="space-y-3">
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
           Se déclenche quand le repository reçoit une nouvelle star
        </p>
      </div>
    </div>

    <!-- new_commit -->
    <div v-else-if="actionType === 'new_commit'" class="space-y-3">
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
          Branch (optionnel)
        </label>
        <input
          v-model="localConfig.branch"
          type="text"
          placeholder="main"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour surveiller la branche principale (main)
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          📝 Se déclenche quand un nouveau commit est poussé sur la branche
        </p>
      </div>
    </div>

    <!-- new_release -->
    <div v-else-if="actionType === 'new_release'" class="space-y-3">
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
      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          🚀 Se déclenche quand une nouvelle release est publiée
        </p>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        Action non reconnue : {{ actionType }}
      </p>
    </div>

    <!-- Help Section -->
    <div class="mt-6 pt-6 border-t border-white/10">
      <h4 class="text-sm font-medium text-white mb-2 flex items-center">
        <Icon name="mdi:help-circle-outline" class="w-4 h-4 mr-2" />
        Comment trouver mon repository ?
      </h4>
      <div class="space-y-2 text-xs text-white/70">
        <p>
          1. Allez sur votre repository GitHub (ex: github.com/<strong>owner</strong>/<strong>repo</strong>)
        </p>
        <p>
          2. L'<strong>owner</strong> est votre nom d'utilisateur ou le nom de l'organisation
        </p>
        <p>
          3. Le <strong>repo</strong> est le nom du repository
        </p>
        <p class="text-yellow-300 mt-3">
          💡 Assurez-vous d'avoir les permissions nécessaires sur le repository
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  actionType: string
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
