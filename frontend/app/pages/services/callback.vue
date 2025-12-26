<!-- pages/services/callback.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4">
    <div class="relative z-10 max-w-md w-full text-center">
      <!-- Success State -->
      <div v-if="success" class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-green-500/30">
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="mdi:check-circle" class="w-12 h-12 text-green-400" />
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Service connecté !</h2>
          <p class="text-green-300 mb-4">
            {{ serviceDisplayName }} a été connecté avec succès à votre compte.
          </p>
          <div class="text-sm text-white/70">
            Redirection vers vos services...
          </div>
        </div>
        <div class="w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div class="bg-green-500 h-full animate-progress" style="animation: progress 1.5s linear forwards;"></div>
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
definePageMeta({
  layout: false,
  middleware: undefined  // Désactiver le middleware auth pour cette page
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
  discord: 'Discord'
}

const serviceName = computed(() => route.query.service || 'unknown')
const serviceDisplayName = computed(() => serviceNames[serviceName.value] || serviceName.value)
const status = computed(() => route.query.status)

const handleServiceCallback = () => {
  try {
    console.log('[Services Callback] Processing callback...')
    console.log('[Services Callback] Service:', serviceName.value)
    console.log('[Services Callback] Status:', status.value)

    // Vérifier que l'utilisateur a un token d'authentification
    const authToken = useCookie('auth-token')

    if (!authToken.value) {
      console.error('[Services Callback] No auth token found')
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }

    console.log('[Services Callback] Auth token exists:', !!authToken.value)

    // Vérifier le statut
    if (status.value !== 'connected') {
      throw new Error('Erreur lors de la connexion du service')
    }

    // Succès !
    success.value = true
    console.log('[Services Callback] Service connected successfully')

    // Rediriger vers /services après 1.5 secondes
    setTimeout(() => {
      console.log('[Services Callback] Redirecting to /services')
      navigateTo('/services')
    }, 1500)

  } catch (err) {
    console.error('[Services Callback] Error:', err)
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

.animate-progress {
  animation: progress 1.5s linear forwards;
}
</style>
