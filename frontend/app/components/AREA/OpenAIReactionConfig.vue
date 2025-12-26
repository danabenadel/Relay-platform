<!-- components/AREA/OpenAIReactionConfig.vue -->
<template>
  <div class="space-y-4">
    <!-- generate_text -->
    <div v-if="reactionType === 'generate_text'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Prompt <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.prompt"
          rows="4"
          placeholder="Write a creative story about..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Instruction pour la génération de texte
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Modèle
        </label>
        <select
          v-model="localConfig.model"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          @change="emit('update:config', localConfig)"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (rapide)</option>
          <option value="gpt-4">GPT-4 (avancé)</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Tokens maximum: {{ localConfig.maxTokens || 500 }}
        </label>
        <input
          v-model.number="localConfig.maxTokens"
          type="range"
          min="100"
          max="2000"
          step="100"
          class="w-full"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
        <p class="text-sm text-purple-300">
          Génère du texte libre basé sur votre prompt
        </p>
      </div>
    </div>

    <!-- summarize_text -->
    <div v-else-if="reactionType === 'summarize_text'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Texte à résumer <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.text"
          rows="6"
          placeholder="Collez le texte à résumer ici..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Longueur maximale du résumé
        </label>
        <input
          v-model="localConfig.maxLength"
          type="text"
          placeholder="200 words"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="emit('update:config', localConfig)"
        />
        <p class="text-xs text-white/50 mt-1">
          Ex: "200 words", "3 paragraphs", "5 bullet points"
        </p>
      </div>

      <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p class="text-sm text-blue-300">
          Résume automatiquement un texte long
        </p>
      </div>
    </div>

    <!-- answer_question -->
    <div v-else-if="reactionType === 'answer_question'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Question <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.question"
          rows="3"
          placeholder="Quelle est la différence entre..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Contexte (optionnel)
        </label>
        <textarea
          v-model="localConfig.context"
          rows="4"
          placeholder="Informations additionnelles pour répondre à la question..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p class="text-sm text-green-300">
          Répond à une question avec contexte optionnel
        </p>
      </div>
    </div>

    <!-- code_review -->
    <div v-else-if="reactionType === 'code_review'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Code à analyser <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.code"
          rows="8"
          placeholder="function example() { ... }"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono text-sm"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Langage
        </label>
        <select
          v-model="localConfig.language"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          @change="emit('update:config', localConfig)"
        >
          <option value="auto-detect">Détection automatique</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
        <p class="text-sm text-orange-300">
          Analyse le code avec GPT-4 pour bugs, sécurité et bonnes pratiques
        </p>
      </div>
    </div>

    <!-- translate_text -->
    <div v-else-if="reactionType === 'translate_text'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Texte à traduire <span class="text-red-400">*</span>
        </label>
        <textarea
          v-model="localConfig.text"
          rows="4"
          placeholder="Hello, how are you?"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-white mb-2">
            Langue source
          </label>
          <select
            v-model="localConfig.sourceLanguage"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @change="emit('update:config', localConfig)"
          >
            <option value="auto-detect">Auto</option>
            <option value="French">Français</option>
            <option value="English">Anglais</option>
            <option value="Spanish">Espagnol</option>
            <option value="German">Allemand</option>
            <option value="Italian">Italien</option>
            <option value="Portuguese">Portugais</option>
            <option value="Chinese">Chinois</option>
            <option value="Japanese">Japonais</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-2">
            Langue cible <span class="text-red-400">*</span>
          </label>
          <select
            v-model="localConfig.targetLanguage"
            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @change="emit('update:config', localConfig)"
          >
            <option value="French">Français</option>
            <option value="English">Anglais</option>
            <option value="Spanish">Espagnol</option>
            <option value="German">Allemand</option>
            <option value="Italian">Italien</option>
            <option value="Portuguese">Portugais</option>
            <option value="Chinese">Chinois</option>
            <option value="Japanese">Japonais</option>
          </select>
        </div>
      </div>

      <div class="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
        <p class="text-sm text-indigo-300">
          Traduit du texte entre différentes langues
        </p>
      </div>
    </div>

    <!-- generate_creative -->
    <div v-else-if="reactionType === 'generate_creative'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Type de contenu <span class="text-red-400">*</span>
        </label>
        <select
          v-model="localConfig.type"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          @change="emit('update:config', localConfig)"
        >
          <option value="poem">Poème</option>
          <option value="story">Histoire courte</option>
          <option value="email">Email professionnel</option>
          <option value="joke">Blague</option>
          <option value="slogan">Slogan publicitaire</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Sujet <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.topic"
          type="text"
          placeholder="L'océan, la technologie, l'amour..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div class="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
        <p class="text-sm text-pink-300">
          Génère du contenu créatif avec GPT-4
        </p>
      </div>
    </div>

    <!-- explain_concept -->
    <div v-else-if="reactionType === 'explain_concept'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Concept à expliquer <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.concept"
          type="text"
          placeholder="La blockchain, la relativité, la photosynthèse..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Niveau de complexité
        </label>
        <select
          v-model="localConfig.level"
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          @change="emit('update:config', localConfig)"
        >
          <option value="child">Enfant (5 ans)</option>
          <option value="teen">Adolescent</option>
          <option value="adult">Adulte</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p class="text-sm text-yellow-300">
          Explique un concept selon le niveau choisi
        </p>
      </div>
    </div>

    <!-- generate_ideas -->
    <div v-else-if="reactionType === 'generate_ideas'" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Sujet <span class="text-red-400">*</span>
        </label>
        <input
          v-model="localConfig.topic"
          type="text"
          placeholder="Un nouveau produit, un projet innovant..."
          class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-white mb-2">
          Nombre d'idées: {{ localConfig.count || 5 }}
        </label>
        <input
          v-model.number="localConfig.count"
          type="range"
          min="3"
          max="10"
          step="1"
          class="w-full"
          @input="emit('update:config', localConfig)"
        />
      </div>

      <div class="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
        <p class="text-sm text-teal-300">
          Génère des idées créatives et innovantes
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

// Initialize default values based on reaction type
if (props.reactionType === 'generate_text') {
  if (!localConfig.value.model) localConfig.value.model = 'gpt-3.5-turbo';
  if (!localConfig.value.maxTokens) localConfig.value.maxTokens = 500;
  if (!localConfig.value.temperature) localConfig.value.temperature = 0.7;
}

if (props.reactionType === 'summarize_text') {
  if (!localConfig.value.maxLength) localConfig.value.maxLength = '200 words';
}

if (props.reactionType === 'code_review') {
  if (!localConfig.value.language) localConfig.value.language = 'auto-detect';
}

if (props.reactionType === 'translate_text') {
  if (!localConfig.value.sourceLanguage) localConfig.value.sourceLanguage = 'auto-detect';
  if (!localConfig.value.targetLanguage) localConfig.value.targetLanguage = 'English';
}

if (props.reactionType === 'generate_creative') {
  if (!localConfig.value.type) localConfig.value.type = 'poem';
}

if (props.reactionType === 'explain_concept') {
  if (!localConfig.value.level) localConfig.value.level = 'adult';
}

if (props.reactionType === 'generate_ideas') {
  if (!localConfig.value.count) localConfig.value.count = 5;
}

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });
</script>
