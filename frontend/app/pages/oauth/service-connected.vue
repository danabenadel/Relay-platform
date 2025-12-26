<!-- pages/oauth/service-connected.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4">
    <div class="relative z-10 max-w-md w-full text-center">
      <!-- Success State -->
      <div v-if="success" class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-green-500/30">
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <Icon name="mdi:check-circle" class="w-12 h-12 text-green-400" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">{{ serviceDisplayName }} connecté !</h2>
          <p class="text-green-300 mb-4">
            {{ serviceDisplayName }} a été connecté avec succès à votre compte.
          </p>
          <div class="text-sm text-white/70">
            Redirection vers vos services...
          </div>
        </div>
        <div class="w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div class="bg-green-500 h-full progress-bar"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-red-500/30">
        <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="mdi:alert-circle" class="w-12 h-12 text-red-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Erreur de connexion</h2>
        <p class="text-red-300 mb-6">{{ error }}</p>
        <NuxtLink
          to="/login"
          class="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Retour à la connexion
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-else class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold text-white mb-2">Finalisation...</h2>
        <p class="text-blue-200">Vérification de la connexion</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas de middleware - cette page est accessible sans authentification
definePageMeta({
  layout: false
})

useHead({
  title: 'Connexion de service - Relay',
  meta: [
    { name: 'description', content: 'Finalisation de la connexion de votre service OAuth' }
  ]
})

const route = useRoute()
const success = ref(false)
const error = ref('')

// Map des noms de services pour l'affichage
const serviceNames = {
  reddit: 'Reddit',
  spotify: 'Spotify',
  google: 'Google',
  github: 'GitHub',
  facebook: 'Facebook',
  discord: 'Discord',
  onedrive: 'OneDrive',
  youtube: 'YouTube',
  gitlab: 'GitLab',
  openai: 'OpenAI'
}

const formatServiceName = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return 'Service';
  }

  return slug
    .split(/[-_\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const serviceName = computed(() => route.query.service || 'unknown')
const serviceDisplayName = computed(() => serviceNames[serviceName.value] || formatServiceName(serviceName.value))
const status = computed(() => route.query.status)

const handleServiceCallback = () => {
  try {
    console.log('[OAuth Service Connected] Processing callback...')
    console.log('[OAuth Service Connected] Service:', serviceName.value)
    console.log('[OAuth Service Connected] Status:', status.value)

    // Vérifier que l'utilisateur a un token d'authentification
    const authToken = useCookie('auth-token')

    if (!authToken.value) {
      console.error('[OAuth Service Connected] No auth token found')
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }

    console.log('[OAuth Service Connected] Auth token exists:', !!authToken.value)

    // Vérifier le statut
    if (status.value !== 'connected') {
      throw new Error('Erreur lors de la connexion du service')
    }

    // Succès !
    success.value = true
    console.log('[OAuth Service Connected] Service connected successfully')

    // Rediriger vers /services après 1.5 secondes
    setTimeout(() => {
      console.log('[OAuth Service Connected] Redirecting to /services')
      navigateTo('/services')
    }, 1500)

  } catch (err) {
    console.error('[OAuth Service Connected] Error:', err)
    error.value = err.message || 'Une erreur est survenue lors de la connexion du service'
  }
}

onMounted(() => {
  // Laisser le temps à la page de se charger et aux cookies d'être disponibles
  setTimeout(handleServiceCallback, 500)
})
</script>

<style scoped>
@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.progress-bar {
  animation: progress 1.5s linear forwards;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
</style>
