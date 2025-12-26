<template>
  <div class="space-y-4">
    <div v-if="actionType === 'youtube_new_video_uploaded'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID (optionnel)
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="UCxxxxxx... (votre chaîne ou celle à surveiller)"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour surveiller vos propres uploads
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Se déclenche quand une nouvelle vidéo est uploadée sur la chaîne
        </p>
      </div>
    </div>

    <div v-else-if="actionType === 'youtube_new_comment'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Video ID (optionnel)
        </label>
        <input
          v-model="localConfig.videoId"
          type="text"
          placeholder="dQw4w9WgXcQ"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          ID dans l'URL: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>. Laissez vide pour tous vos commentaires
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Se déclenche quand un nouveau commentaire est posté
        </p>
      </div>
    </div>

    <div v-else-if="actionType === 'youtube_new_subscriber'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          Se déclenche automatiquement quand quelqu'un s'abonne à votre chaîne
        </p>
      </div>
    </div>

    <div v-else-if="actionType === 'youtube_video_liked'" class="space-y-3">
      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          Aucune configuration requise
        </p>
        <p class="text-xs text-white/60 mt-1">
          Se déclenche quand vous likez une nouvelle vidéo YouTube
        </p>
      </div>
    </div>

    <div v-else-if="actionType === 'youtube_livestream_started'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Channel ID (optionnel)
        </label>
        <input
          v-model="localConfig.channelId"
          type="text"
          placeholder="UCxxxxxx..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Laissez vide pour surveiller vos propres lives
        </p>
      </div>
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <p class="text-sm text-red-300">
          Se déclenche quand un livestream démarre
        </p>
      </div>
    </div>

    <div v-else class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
      <p class="text-sm text-red-300">
        Action inconnue: {{ actionType }}
      </p>
    </div>

    <div class="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
      <div class="flex items-center justify-between">
        <label class="block text-sm font-medium text-white">
          Fréquence de vérification
        </label>
        <span class="text-xs text-white/60">{{ displayInterval }} minutes</span>
      </div>
      <input
        v-model.number="localConfig.checkInterval"
        type="range"
        :min="minInterval"
        :max="maxInterval"
        step="60"
        class="w-full accent-red-500"
        @input="onIntervalChange"
      />
      <div class="flex items-center gap-2">
        <input
          v-model.number="localConfig.checkInterval"
          type="number"
          :min="minInterval"
          :max="maxInterval"
          step="60"
          class="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          @input="onIntervalChange"
        />
        <span class="text-xs text-white/60">Secondes (min {{ minInterval }}s, max {{ maxInterval }}s)</span>
      </div>
      <p class="text-xs text-white/50">
        Plus l'intervalle est long, moins l'API YouTube est sollicitée. Ajustez pour préserver le quota.
      </p>
    </div>

    <div class="bg-white/5 rounded-lg p-3 mt-4">
      <button
        @click="showHelp = !showHelp"
        class="flex items-center justify-between w-full text-sm text-white/70 hover:text-white"
      >
        <span>Comment trouver les IDs YouTube ?</span>
        <Icon :name="showHelp ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" />
      </button>
      <div v-if="showHelp" class="mt-3 space-y-2 text-xs text-white/60">
        <p><strong class="text-white/80">Video ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Ouvrez une vidéo YouTube</li>
          <li>Regardez l'URL: https://youtube.com/watch?v=<strong class="text-red-300">dQw4w9WgXcQ</strong></li>
          <li>L'ID est la partie après v=</li>
        </ol>
        <p class="mt-3"><strong class="text-white/80">Channel ID:</strong></p>
        <ol class="list-decimal list-inside space-y-1 ml-2">
          <li>Allez sur votre chaîne ou celle à surveiller</li>
          <li>URL: https://youtube.com/channel/<strong class="text-red-300">UCxxxxxx...</strong></li>
          <li>Ou cliquez sur "Personnaliser la chaîne" → Paramètres pour trouver l'ID</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

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

const minInterval = 60; // 1 minute
const maxInterval = 3600; // 1 heure
const defaultInterval = 60; // 1 minute par défaut

const clampInterval = (value: number | null | undefined) => {
  let numericValue = Number(value ?? defaultInterval);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    numericValue = defaultInterval;
  }
  if (numericValue < minInterval) return minInterval;
  if (numericValue > maxInterval) return maxInterval;
  return Math.round(numericValue / 60) * 60;
};

const ensureInterval = (emitChange = false) => {
  const normalized = clampInterval(localConfig.value.checkInterval);
  if (normalized !== localConfig.value.checkInterval) {
    localConfig.value.checkInterval = normalized;
    if (emitChange) {
      emit('update:config', { ...localConfig.value });
    }
    return true;
  }
  return false;
};

ensureInterval(true);

const displayInterval = computed(() =>
  Math.round((localConfig.value.checkInterval || defaultInterval) / 60)
);

const onIntervalChange = () => {
  ensureInterval();
  emit('update:config', { ...localConfig.value });
};

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
  ensureInterval(true);
}, { deep: true });

watch(() => localConfig.value.checkInterval, (value) => {
  const normalized = clampInterval(value);
  if (normalized !== value) {
    localConfig.value.checkInterval = normalized;
  }
}, { immediate: true });
</script>
