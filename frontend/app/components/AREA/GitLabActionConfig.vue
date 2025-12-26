<!-- components/AREA/GitLabActionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- new_issue -->
    <div v-if="actionType === 'new_issue'" class="space-y-3">
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
        <p class="text-xs text-white/50 mt-1">
          L'ID numérique du projet ou le chemin URL-encoded (group/project)
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          ✨ Se déclenche quand une nouvelle issue est créée dans le projet
        </p>
      </div>
    </div>

    <!-- merge_request_merged -->
    <div v-else-if="actionType === 'merge_request_merged'" class="space-y-3">
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
        <p class="text-xs text-white/50 mt-1">
          L'ID numérique du projet ou le chemin URL-encoded
        </p>
      </div>
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          ✅ Se déclenche quand une merge request est mergée dans le projet
        </p>
      </div>
    </div>

    <!-- new_merge_request -->
    <div v-else-if="actionType === 'new_merge_request'" class="space-y-3">
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
        <p class="text-xs text-white/50 mt-1">
          L'ID numérique du projet ou le chemin URL-encoded
        </p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          📝 Se déclenche quand une nouvelle merge request est ouverte
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
        Comment trouver mon Project ID ?
      </h4>
      <div class="space-y-2 text-xs text-white/70">
        <p>
          1. Allez sur votre projet GitLab (ex: gitlab.com/<strong>group</strong>/<strong>project</strong>)
        </p>
        <p>
          2. Le <strong>Project ID</strong> se trouve dans les paramètres du projet (Settings > General)
        </p>
        <p>
          3. Vous pouvez aussi utiliser le chemin complet : <strong>group/project</strong>
        </p>
        <p class="text-yellow-300 mt-3">
          💡 Assurez-vous d'avoir les permissions nécessaires sur le projet
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
