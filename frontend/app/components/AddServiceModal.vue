<!-- app/components/AddServiceModal.vue -->
<template>
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white">➕ Ajouter un nouveau service</h2>
            <p class="text-white/70">Configurez un nouveau service pour étendre les fonctionnalités</p>
          </div>
          <button @click="$emit('close')" class="text-white/60 hover:text-white text-2xl p-2 rounded-lg hover:bg-white/10 transition-all">
            ✕
          </button>
        </div>
  
        <!-- Formulaire -->
        <form @submit.prevent="addService" class="space-y-6">
          <!-- Informations de base -->
          <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 class="text-lg font-semibold text-white mb-4">ℹ️ Informations de base</h3>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">Nom du service *</label>
                <input 
                  v-model="serviceForm.name" 
                  type="text" 
                  required 
                  placeholder="ex: notion, spotify, discord"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                <p class="text-xs text-white/50 mt-1">Nom unique en minuscules</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">Icône (emoji)</label>
                <input 
                  v-model="serviceForm.icon" 
                  type="text" 
                  placeholder="📝 🎵 💬"
                  maxlength="2"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                <p class="text-xs text-white/50 mt-1">Emoji représentant le service</p>
              </div>
            </div>
  
            <div class="mb-4">
              <label class="block text-sm font-medium text-white/90 mb-1">Description *</label>
              <textarea 
                v-model="serviceForm.description" 
                required 
                placeholder="Description du service et de ses fonctionnalités principales..."
                rows="3"
                class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              ></textarea>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">URL de l'API</label>
                <input 
                  v-model="serviceForm.apiUrl" 
                  type="url" 
                  placeholder="https://api.service.com"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">Type d'authentification</label>
                <select 
                  v-model="serviceForm.authType" 
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="apikey">Clé API</option>
                  <option value="basic">Authentification basique</option>
                  <option value="bearer">Token Bearer</option>
                  <option value="webhook">Webhooks uniquement</option>
                  <option value="none">Aucune authentification</option>
                </select>
              </div>
            </div>
          </div>
  
          <!-- Configuration OAuth (si sélectionné) -->
          <div v-if="serviceForm.authType === 'oauth2'" class="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
            <h3 class="text-lg font-semibold text-white mb-4">🔐 Configuration OAuth 2.0</h3>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">Client ID</label>
                <input 
                  v-model="serviceForm.oauth.clientId" 
                  type="text" 
                  placeholder="your_client_id"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">Client Secret</label>
                <input 
                  v-model="serviceForm.oauth.clientSecret" 
                  type="password" 
                  placeholder="your_client_secret"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">URL d'autorisation</label>
                <input 
                  v-model="serviceForm.oauth.authUrl" 
                  type="url" 
                  placeholder="https://auth.service.com/oauth"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">URL de token</label>
                <input 
                  v-model="serviceForm.oauth.tokenUrl" 
                  type="url" 
                  placeholder="https://auth.service.com/token"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
  
          <!-- Actions par défaut -->
          <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-white">📤 Actions par défaut</h3>
              <button 
                type="button" 
                @click="addAction" 
                class="text-blue-400 hover:text-blue-300 text-sm bg-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                ➕ Ajouter une action
              </button>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(action, index) in serviceForm.actions" 
                :key="index" 
                class="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div class="flex-1 space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-white/70 mb-1">Nom de l'action</label>
                      <input 
                        v-model="action.name" 
                        type="text" 
                        placeholder="ex: new_message, file_uploaded" 
                        class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:ring-1 focus:ring-blue-500"
                      >
                    </div>
                    <div>
                      <label class="block text-xs text-white/70 mb-1">Type de déclencheur</label>
                      <select 
                        v-model="action.trigger" 
                        class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="webhook">Webhook</option>
                        <option value="polling">Polling</option>
                        <option value="realtime">Temps réel</option>
                        <option value="schedule">Planifié</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-white/70 mb-1">Description</label>
                    <input 
                      v-model="action.description" 
                      type="text" 
                      placeholder="Décrivez quand cette action se déclenche..." 
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:ring-1 focus:ring-blue-500"
                    >
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="removeAction(index)" 
                  class="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  :disabled="serviceForm.actions.length === 1"
                >
                  🗑️
                </button>
              </div>
              
              <div v-if="serviceForm.actions.length === 0" class="text-center py-6 text-white/50">
                Aucune action configurée
              </div>
            </div>
          </div>
  
          <!-- Réactions par défaut -->
          <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-white">📥 Réactions par défaut</h3>
              <button 
                type="button" 
                @click="addReaction" 
                class="text-green-400 hover:text-green-300 text-sm bg-green-500/20 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-all"
              >
                ➕ Ajouter une réaction
              </button>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(reaction, index) in serviceForm.reactions" 
                :key="index" 
                class="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div class="flex-1 space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs text-white/70 mb-1">Nom de la réaction</label>
                      <input 
                        v-model="reaction.name" 
                        type="text" 
                        placeholder="ex: send_message, create_file" 
                        class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:ring-1 focus:ring-green-500"
                      >
                    </div>
                    <div>
                      <label class="block text-xs text-white/70 mb-1">Méthode d'exécution</label>
                      <select 
                        v-model="reaction.method" 
                        class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500"
                      >
                        <option value="api">API REST</option>
                        <option value="webhook">Webhook</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="push">Notification push</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-white/70 mb-1">Description</label>
                    <input 
                      v-model="reaction.description" 
                      type="text" 
                      placeholder="Décrivez ce que fait cette réaction..." 
                      class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:ring-1 focus:ring-green-500"
                    >
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="removeReaction(index)" 
                  class="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  :disabled="serviceForm.reactions.length === 1"
                >
                  🗑️
                </button>
              </div>
              
              <div v-if="serviceForm.reactions.length === 0" class="text-center py-6 text-white/50">
                Aucune réaction configurée
              </div>
            </div>
          </div>
  
          <!-- Configuration avancée -->
          <details class="bg-white/5 rounded-2xl border border-white/10">
            <summary class="cursor-pointer text-white/80 hover:text-white p-6 transition-colors">
              🔧 Configuration avancée (optionnel)
            </summary>
            <div class="px-6 pb-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-white/90 mb-1">Catégorie</label>
                  <select 
                    v-model="serviceForm.category" 
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="communication">Communication</option>
                    <option value="productivity">Productivité</option>
                    <option value="storage">Stockage</option>
                    <option value="social">Réseaux sociaux</option>
                    <option value="entertainment">Divertissement</option>
                    <option value="development">Développement</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/90 mb-1">Popularité</label>
                  <select 
                    v-model="serviceForm.popularity" 
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="trending">Tendance</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-white/90 mb-1">Documentation URL</label>
                <input 
                  v-model="serviceForm.docsUrl" 
                  type="url" 
                  placeholder="https://docs.service.com/api"
                  class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                >
              </div>
              
              <div class="flex items-center space-x-3">
                <input 
                  v-model="serviceForm.isActive" 
                  type="checkbox" 
                  id="isActive"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
                >
                <label for="isActive" class="text-sm text-white/80">
                  Activer immédiatement ce service
                </label>
              </div>
            </div>
          </details>
  
          <!-- Aperçu du service -->
          <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
            <h3 class="text-lg font-semibold text-white mb-4">👀 Aperçu du service</h3>
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                {{ serviceForm.icon || '⚙️' }}
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-white capitalize">{{ serviceForm.name || 'Nom du service' }}</h4>
                <p class="text-white/70 text-sm mt-1">{{ serviceForm.description || 'Description du service' }}</p>
                <div class="flex gap-2 mt-2">
                  <span class="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {{ serviceForm.actions.filter(a => a.name).length }} actions
                  </span>
                  <span class="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    {{ serviceForm.reactions.filter(r => r.name).length }} réactions
                  </span>
                  <span class="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    {{ serviceForm.authType }}
                  </span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Actions du formulaire -->
          <div class="flex gap-3 pt-6 border-t border-white/20">
            <button 
              type="submit" 
              :disabled="!isFormValid"
              class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              🚀 Créer le service
            </button>
            <button 
              type="button" 
              @click="resetForm" 
              class="px-6 py-3 bg-yellow-600/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-600/30 transition-all"
            >
              🔄 Réinitialiser
            </button>
            <button 
              type="button" 
              @click="$emit('close')" 
              class="px-6 py-3 bg-gray-600/50 hover:bg-gray-600 text-white rounded-xl transition-all"
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  // Emits
  const emit = defineEmits(['close', 'add'])
  
  // État du formulaire
  const serviceForm = reactive({
    name: '',
    icon: '',
    description: '',
    apiUrl: '',
    authType: 'oauth2',
    category: 'other',
    popularity: 'medium',
    docsUrl: '',
    isActive: true,
    oauth: {
      clientId: '',
      clientSecret: '',
      authUrl: '',
      tokenUrl: ''
    },
    actions: [
      { name: '', description: '', trigger: 'webhook' }
    ],
    reactions: [
      { name: '', description: '', method: 'api' }
    ]
  })
  
  // Computed
  const isFormValid = computed(() => {
    const hasBasicInfo = serviceForm.name && serviceForm.description
    const hasValidActions = serviceForm.actions.some(a => a.name && a.description)
    const hasValidReactions = serviceForm.reactions.some(r => r.name && r.description)
    return hasBasicInfo && (hasValidActions || hasValidReactions)
  })
  
  // Méthodes pour les actions
  const addAction = () => {
    serviceForm.actions.push({ 
      name: '', 
      description: '', 
      trigger: 'webhook' 
    })
  }
  
  const removeAction = (index) => {
    if (serviceForm.actions.length > 1) {
      serviceForm.actions.splice(index, 1)
    }
  }
  
  // Méthodes pour les réactions
  const addReaction = () => {
    serviceForm.reactions.push({ 
      name: '', 
      description: '', 
      method: 'api' 
    })
  }
  
  const removeReaction = (index) => {
    if (serviceForm.reactions.length > 1) {
      serviceForm.reactions.splice(index, 1)
    }
  }
  
  // Méthodes principales
  const addService = () => {
    // Nettoyer les données avant envoi
    const cleanedService = {
      ...serviceForm,
      actions: serviceForm.actions.filter(a => a.name && a.description),
      reactions: serviceForm.reactions.filter(r => r.name && r.description)
    }
    
    // Supprimer les champs OAuth si pas utilisés
    if (serviceForm.authType !== 'oauth2') {
      delete cleanedService.oauth
    }
    
    emit('add', cleanedService)
  }
  
  const resetForm = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ?')) {
      Object.assign(serviceForm, {
        name: '',
        icon: '',
        description: '',
        apiUrl: '',
        authType: 'oauth2',
        category: 'other',
        popularity: 'medium',
        docsUrl: '',
        isActive: true,
        oauth: {
          clientId: '',
          clientSecret: '',
          authUrl: '',
          tokenUrl: ''
        },
        actions: [
          { name: '', description: '', trigger: 'webhook' }
        ],
        reactions: [
          { name: '', description: '', method: 'api' }
        ]
      })
    }
  }
  
  // Auto-focus sur le premier champ
  onMounted(() => {
    const firstInput = document.querySelector('input[type="text"]')
    if (firstInput) {
      firstInput.focus()
    }
  })
  </script>