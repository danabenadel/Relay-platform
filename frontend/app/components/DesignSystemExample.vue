<!-- Composant d'exemple du Design System Relay -->
<template>
  <div class="relay-bg-gradient min-h-screen p-8">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- Header avec titre gradient -->
      <div class="text-center mb-12">
        <h1 class="relay-text-gradient text-4xl md:text-6xl font-bold mb-4">
          Relay Design System
        </h1>
        <p class="relay-text-secondary text-xl">
          Exemples d'utilisation des couleurs et composants
        </p>
      </div>

      <!-- Section Boutons -->
      <section class="relay-card rounded-3xl p-8">
        <h2 class="relay-text-white text-2xl font-bold mb-6">Boutons</h2>
        <div class="flex flex-wrap gap-4">
          <button class="relay-btn-primary px-6 py-3 rounded-xl font-medium">
            Bouton Principal
          </button>
          <button class="relay-btn-secondary px-6 py-3 rounded-xl font-medium">
            Bouton Secondaire
          </button>
          <button class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Bouton Danger (Custom)
          </button>
        </div>
      </section>

      <!-- Section Cartes -->
      <section>
        <h2 class="relay-text-white text-2xl font-bold mb-6">Cartes</h2>
        <div class="grid md:grid-cols-3 gap-6">

          <!-- Carte Standard -->
          <div class="relay-card rounded-2xl p-6">
            <div class="w-12 h-12 relay-bg-primary rounded-xl flex items-center justify-center mb-4">
              <span class="text-2xl">🚀</span>
            </div>
            <h3 class="relay-text-white text-xl font-bold mb-2">Carte Standard</h3>
            <p class="relay-text-secondary">
              Utilise les classes du design system pour un effet verre cohérent.
            </p>
          </div>

          <!-- Carte Workflow Trigger -->
          <div class="relay-workflow-trigger border rounded-2xl p-6 backdrop-blur-sm">
            <div class="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center mb-4">
              <span class="text-2xl">⚡</span>
            </div>
            <h3 class="relay-text-white text-xl font-bold mb-2">Déclencheur</h3>
            <p class="relay-text-primary">
              Style spécifique pour les éléments de workflow trigger.
            </p>
          </div>

          <!-- Carte Workflow Process -->
          <div class="relay-workflow-process border rounded-2xl p-6 backdrop-blur-sm">
            <div class="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center mb-4">
              <span class="text-2xl">⚙️</span>
            </div>
            <h3 class="relay-text-white text-xl font-bold mb-2">Traitement</h3>
            <p class="relay-text-primary">
              Style spécifique pour les éléments de workflow process.
            </p>
          </div>
        </div>
      </section>

      <!-- Section Textes -->
      <section class="relay-card rounded-3xl p-8">
        <h2 class="relay-text-white text-2xl font-bold mb-6">Hiérarchie des Textes</h2>
        <div class="space-y-4">
          <h1 class="relay-text-white text-4xl font-bold">Titre Principal (relay-text-white)</h1>
          <h2 class="relay-text-primary text-2xl font-semibold">Titre Secondaire (relay-text-primary)</h2>
          <p class="relay-text-secondary text-lg">Paragraphe principal (relay-text-secondary)</p>
          <p class="relay-text-muted">Texte discret ou métadonnées (relay-text-muted)</p>
        </div>
      </section>

      <!-- Section Variables CSS -->
      <section class="relay-card rounded-3xl p-8">
        <h2 class="relay-text-white text-2xl font-bold mb-6">Variables CSS Personnalisées</h2>
        <div class="grid md:grid-cols-2 gap-6">

          <!-- Utilisation avec style direct -->
          <div class="space-y-4">
            <h3 class="relay-text-primary text-lg font-semibold">Avec variables CSS</h3>
            <div class="custom-element p-4 rounded-xl">
              <p class="text-white">Élément avec styles personnalisés utilisant les variables CSS du design system.</p>
            </div>
          </div>

          <!-- Gradients -->
          <div class="space-y-4">
            <h3 class="relay-text-primary text-lg font-semibold">Gradients</h3>
            <div style="background: var(--relay-gradient-primary)" class="p-4 rounded-xl">
              <p class="text-white font-medium">Gradient Principal</p>
            </div>
            <div style="background: var(--relay-gradient-text); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;" class="text-2xl font-bold">
              Texte avec Gradient
            </div>
          </div>
        </div>
      </section>

      <!-- Section Workflow Complet -->
      <section class="relay-card rounded-3xl p-8">
        <h2 class="relay-text-white text-2xl font-bold mb-6 text-center">Exemple de Workflow</h2>
        <div class="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-6">

          <!-- Trigger -->
          <div class="relay-workflow-trigger border rounded-2xl p-6 backdrop-blur-sm text-center">
            <div class="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">📧</span>
            </div>
            <h4 class="relay-text-white font-bold mb-2">Email Reçu</h4>
            <p class="relay-text-primary text-sm">Déclencheur</p>
          </div>

          <!-- Arrow -->
          <div class="text-blue-400">
            <span class="text-2xl">→</span>
          </div>

          <!-- Process -->
          <div class="relay-workflow-process border rounded-2xl p-6 backdrop-blur-sm text-center">
            <div class="w-16 h-16 bg-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">⚙️</span>
            </div>
            <h4 class="relay-text-white font-bold mb-2">Analyse</h4>
            <p class="relay-text-primary text-sm">Traitement</p>
          </div>

          <!-- Arrow -->
          <div class="text-indigo-400">
            <span class="text-2xl">→</span>
          </div>

          <!-- Action -->
          <div class="relay-workflow-action border rounded-2xl p-6 backdrop-blur-sm text-center">
            <div class="w-16 h-16 bg-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">📱</span>
            </div>
            <h4 class="relay-text-white font-bold mb-2">Notification</h4>
            <p class="relay-text-primary text-sm">Action</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="text-center pt-8">
        <p class="relay-text-muted">
          Design System Relay - Utilisez ces composants pour maintenir la cohérence visuelle
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Exemple d'utilisation des variables CSS personnalisées */
.custom-element {
  background: var(--relay-surface-glass);
  border: 1px solid var(--relay-surface-glass-border);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.custom-element:hover {
  background: var(--relay-surface-glass-hover);
  transform: translateY(-2px);
}

/* Animation pour les flèches */
@media (max-width: 1024px) {
  .lg\\:space-x-6 .text-2xl {
    transform: rotate(90deg);
  }
}
</style>