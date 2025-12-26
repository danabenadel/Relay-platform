<template>
  <div>
    <button
      @click="cycleMode"
      class="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
      :aria-label="`Mode d'accessibilité visuelle : ${getModeLabel()}. Cliquez pour changer.`"
      :title="getModeLabel()"
      role="button"
      tabindex="0"
      @keydown.enter="cycleMode"
      @keydown.space.prevent="cycleMode"
    >
      <span aria-hidden="true">👁️</span> {{ getModeLabel() }}
    </button>

    <!-- Zone d'annonce pour les lecteurs d'écran -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
const currentModeIndex = ref(0)
const announcement = ref('')

const modes = [
  { value: 'none', label: 'Normal', description: 'Vision normale sans filtre' },
  { value: 'protanopia', label: 'Protanopie', description: 'Filtre pour déficience rouge' },
  { value: 'deuteranopia', label: 'Deutéranopie', description: 'Filtre pour déficience vert' },
  { value: 'tritanopia', label: 'Tritanopie', description: 'Filtre pour déficience bleu' },
  { value: 'monochrome', label: 'Monochrome', description: 'Affichage en niveaux de gris' }
]

const cycleMode = () => {
  currentModeIndex.value = (currentModeIndex.value + 1) % modes.length
  applyMode()
  announceChange()
}

const applyMode = () => {
  const mode = modes[currentModeIndex.value].value

  document.body.classList.remove(
    'colorblind-protanopia',
    'colorblind-deuteranopia',
    'colorblind-tritanopia',
    'colorblind-monochrome'
  )

  if (mode !== 'none') {
    document.body.classList.add(`colorblind-${mode}`)
  }

  localStorage.setItem('colorblindMode', mode)
}

const announceChange = () => {
  const mode = modes[currentModeIndex.value]
  if (mode) {
    announcement.value = `Mode d'accessibilité changé à ${mode.label}. ${mode.description}.`
  }
}

const getModeLabel = () => {
  return modes[currentModeIndex.value].label
}

// Charger le mode sauvegardé au démarrage
onMounted(() => {
  const saved = localStorage.getItem('colorblindMode')
  if (saved) {
    const index = modes.findIndex(m => m.value === saved)
    if (index !== -1) {
      currentModeIndex.value = index
      applyMode()
    }
  }
})
</script>

<style scoped>
/* Classe pour masquer visuellement mais garder accessible aux lecteurs d'écran */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
