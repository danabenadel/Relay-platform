<!-- app/pages/auth/callback.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4">
    <div class="relative z-10 max-w-md w-full text-center">
      <div v-if="loading" class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 class="text-2xl font-bold text-white mb-2">Connexion en cours...</h2>
        <p class="text-blue-200">Finalisation de votre authentification</p>
      </div>

      <div v-else-if="error" class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-red-500/30">
        <h2 class="text-2xl font-bold text-white mb-2">Erreur de connexion</h2>
        <p class="text-red-300 mb-6">{{ error }}</p>
        <NuxtLink
          to="/login"
          class="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Retour à la connexion
        </NuxtLink>
      </div>

      <div v-else-if="success" class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-green-500/30">
        <h2 class="text-2xl font-bold text-white mb-2">Connexion réussie !</h2>
        <p class="text-green-300 mb-6">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

useHead({
  title: 'Authentification - Relay',
  meta: [
    { name: 'description', content: 'Finalisation de votre authentification OAuth' }
  ]
})

const loading = ref(true)
const error = ref('')
const success = ref(false)

const config = useRuntimeConfig()
const route = useRoute()

const handleOAuthCallback = async () => {
  try {
    console.log('[OAuth Callback] Processing callback...')
    console.log('[OAuth Callback] Query params:', route.query)

    const { error: oauthError, token, user } = route.query

    // Vérifier si on a une erreur OAuth
    if (oauthError) {
      throw new Error(`Erreur OAuth: ${oauthError}`)
    }

    // Le backend renvoie directement le token et user dans l'URL
    if (token) {
      console.log('[OAuth Callback] Token received from URL')

      const authToken = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      const userData = useCookie('user-data', {
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      // Stocker le token
      authToken.value = token

      // Parser et stocker les données utilisateur si elles existent
      if (user) {
        try {
          userData.value = typeof user === 'string' ? JSON.parse(user) : user
        } catch (e) {
          console.error('[OAuth Callback] Error parsing user data:', e)
          userData.value = user
        }
      }

      sessionStorage.removeItem('oauth_provider')

      success.value = true
      loading.value = false

      console.log('[OAuth Callback] Authentication successful, redirecting to dashboard...')

      const returnUrl = useCookie('oauth-return-url')
      const redirectTo = returnUrl.value || '/dashboard'

      setTimeout(() => {
        navigateTo(redirectTo)
      }, 1500)

    } else {
      throw new Error('Token manquant dans la réponse OAuth')
    }

  } catch (err) {
    console.error('[OAuth Callback] Error:', err)
    error.value = err.message || 'Une erreur est survenue lors de l\'authentification'
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(handleOAuthCallback, 500)
})
</script>