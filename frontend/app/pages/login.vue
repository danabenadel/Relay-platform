<!-- app/pages/login.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center py-12 px-4">
    <!-- Skip Links -->
    <SkipLinks />

    <div class="absolute inset-0" aria-hidden="true">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
    </div>

    <main id="main-content" class="relative z-10 max-w-md w-full" role="main">
      <!---Retour page d'accueil-->
      <header class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-2">
          <NuxtLink
            to="/"
            class="text-white/70 hover:text-white transition-colors group focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
            aria-label="Retour à la page d'accueil"
          >
            <Icon name="mdi:arrow-left" class="w-6 h-6 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          </NuxtLink>
          <h1 class="text-3xl font-bold text-white">Bon retour !</h1>
          <ColorblindSelector />
        </div>
        <p class="text-blue-200">Connectez-vous pour automatiser vos tâches</p>
      </header>

      <div class="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden" role="region" aria-labelledby="login-title">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" aria-hidden="true"></div>

        <div class="relative z-10">
          <h2 id="login-title" class="sr-only">Formulaire de connexion</h2>
          <form @submit.prevent="handleLogin" class="space-y-6" aria-label="Formulaire de connexion">
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-white/90">
                Adresse email
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="votre@email.com"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-white/50 hover:bg-white/15"
                :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'email-error' : undefined"
              >
              <p v-if="errors.email" id="email-error" class="text-red-400 text-sm flex items-center" role="alert">
                <span class="mr-1" aria-hidden="true">⚠️</span>{{ errors.email }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-white/90">
                Mot de passe
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-white/50 hover:bg-white/15"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.password }"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="errors.password ? 'password-error' : undefined"
                >
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  <span v-if="showPassword" class="text-lg" aria-hidden="true">🙈</span>
                  <span v-else class="text-lg" aria-hidden="true">👁️</span>
                </button>
              </div>
              <p v-if="errors.password" id="password-error" class="text-red-400 text-sm flex items-center" role="alert">
                <span class="mr-1" aria-hidden="true">⚠️</span>{{ errors.password }}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <input
                  id="remember"
                  v-model="form.remember"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
                  aria-describedby="remember-description"
                >
                <label for="remember" class="text-sm text-white/80">
                  Se souvenir de moi
                </label>
                <span id="remember-description" class="sr-only">Rester connecté pendant 30 jours</span>
              </div>
              <div class="text-sm">
                <a
                  href="#"
                  @click.prevent="showForgotPassword = true"
                  class="font-medium text-blue-300 hover:text-blue-200 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none rounded px-1"
                  aria-label="Réinitialiser votre mot de passe oublié"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden focus:ring-2 focus:ring-blue-400 focus:outline-none"
              :aria-busy="loading"
              :aria-live="loading ? 'polite' : undefined"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
              <span v-else class="relative z-10 flex items-center justify-center">
                Se connecter
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
            </button>

            <div v-if="errors.global" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm" role="alert" aria-live="assertive">
              <p class="text-red-300 text-sm flex items-center">
                <span class="mr-2 text-lg" aria-hidden="true">🚨</span>{{ errors.global }}
              </p>
            </div>

            <div v-if="successMessage" class="bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm" role="status" aria-live="polite">
              <p class="text-green-300 text-sm flex items-center">
                <span class="mr-2 text-lg" aria-hidden="true">✅</span>{{ successMessage }}
              </p>
            </div>
          </form>

          <div class="mt-8">
            <div class="relative" role="separator" aria-label="Ou">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-white/20" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white/10 backdrop-blur-sm text-white/70 rounded-full">Ou se connecter avec</span>
              </div>
            </div>

            <div class="mt-6 flex justify-center gap-4" role="group" aria-label="Options de connexion OAuth">
              <button
                @click="loginWithOAuth('google')"
                type="button"
                class="group w-14 h-14 inline-flex justify-center items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Se connecter avec Google"
              >
                <Icon name="mdi:google" class="w-7 h-7" aria-hidden="true" />
              </button>
              <button
                @click="loginWithOAuth('github')"
                type="button"
                class="group w-14 h-14 inline-flex justify-center items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Se connecter avec GitHub"
              >
                <Icon name="mdi:github" class="w-7 h-7" aria-hidden="true" />
              </button>
              <button
                @click="loginWithOAuth('facebook')"
                type="button"
                class="group w-14 h-14 inline-flex justify-center items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Se connecter avec Facebook"
              >
                <Icon name="mdi:facebook" class="w-7 h-7" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="mt-8 text-center">
            <p class="text-white/70">
              Vous n'avez pas encore de compte ?
              <NuxtLink
                to="/register"
                class="font-medium text-blue-300 hover:text-blue-200 underline ml-1 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                aria-label="Créer un nouveau compte gratuitement"
              >
                Créer un compte gratuitement
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <footer class="text-center mt-6 text-xs text-white/50" role="contentinfo">
        <p>Connexion sécurisée • Vos données sont protégées</p>
      </footer>
    </main>

    <div
      v-if="showForgotPassword"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="showForgotPassword = false"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div
        @click.stop
        class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 relative"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl" aria-hidden="true"></div>

        <div class="relative z-10">
          <h3 id="forgot-password-title" class="text-2xl font-bold text-white mb-4 text-center">Mot de passe oublié ?</h3>
          <p class="text-white/70 mb-6 text-center">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <div>
              <label for="forgot-email" class="sr-only">Adresse email</label>
              <input
                id="forgot-email"
                v-model="forgotEmail"
                type="email"
                required
                placeholder="votre@email.com"
                class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-white/50"
                aria-label="Entrez votre adresse email"
              >
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="loadingForgot"
                class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                :aria-busy="loadingForgot"
              >
                {{ loadingForgot ? 'Envoi...' : 'Envoyer le lien' }}
              </button>
              <button
                type="button"
                @click="showForgotPassword = false"
                class="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Fermer la fenêtre"
              >
                Annuler
              </button>
            </div>
          </form>

          <div v-if="forgotMessage" class="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl" role="status" aria-live="polite">
            <p class="text-green-300 text-sm text-center">{{ forgotMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
})

useHead({
  title: 'Connexion - Relay',
  meta: [
    { name: 'description', content: 'Connectez-vous à votre compte Relay pour automatiser vos tâches' }
  ]
})

// État réactif
const form = reactive({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)
const showPassword = ref(false)
const successMessage = ref('')
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const loadingForgot = ref(false)
const forgotMessage = ref('')

const errors = reactive({
  email: '',
  password: '',
  global: ''
})

const config = useRuntimeConfig()

const isFormValid = computed(() => {
  return form.email.includes('@') && form.password.length >= 6
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  errors.global = ''

  let isValid = true

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = 'L\'email est requis'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Format d\'email invalide'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  errors.global = ''

  try {
    const response = await $fetch('/auth/login', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      body: {
        email: form.email,
        password: form.password
      }
    })

    // Le backend renvoie { success: true, data: { token, user } }
    if (!response.success) {
      throw new Error(response.error || 'Erreur de connexion')
    }

    const token = useCookie('auth-token', {
      maxAge: form.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    const user = useCookie('user-data', {
      maxAge: form.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    token.value = response.data.token
    user.value = response.data.user

    successMessage.value = 'Connexion réussie ! Redirection...'

    setTimeout(() => {
      navigateTo('/dashboard')
    }, 1500)

  } catch (error) {
    console.error('Erreur de connexion:', error)

    if (error.status === 401) {
      errors.global = error.data?.error || 'Email ou mot de passe incorrect'
    } else if (error.status === 429) {
      errors.global = 'Trop de tentatives. Réessayez dans quelques minutes.'
    } else if (error.status === 400) {
      errors.global = error.data?.error || 'Données invalides. Vérifiez vos informations.'
    } else if (error.status >= 500) {
      errors.global = 'Erreur serveur. Veuillez réessayer plus tard.'
    } else {
      errors.global = error.data?.error || error.message || 'Une erreur est survenue lors de la connexion'
    }
  } finally {
    loading.value = false
  }
}

const loginWithOAuth = (provider) => {
  console.log(`[OAuth] Attempting login with ${provider}`)

  try {
    // Stocker l'URL de retour et le provider
    const returnUrl = useCookie('oauth-return-url')
    returnUrl.value = '/dashboard'

    // Stocker le provider pour le callback
    sessionStorage.setItem('oauth_provider', provider)

    // Récupérer la configuration
    const runtimeConfig = useRuntimeConfig()
    const apiBaseUrl = runtimeConfig.public.apiBaseUrl || 'http://localhost:8080'

    // Construire l'URL OAuth
    const oauthUrl = `${apiBaseUrl}/auth/oauth/${provider}`

    console.log(`[OAuth] Redirecting to: ${oauthUrl}`)

    // Redirection directe vers OAuth
    window.location.href = oauthUrl

  } catch (error) {
    console.error(`[OAuth] Error during ${provider} login:`, error)
    errors.global = `Erreur lors de la connexion avec ${provider}. Veuillez réessayer.`
  }
}

const handleForgotPassword = async () => {
  if (!forgotEmail.value || !forgotEmail.value.includes('@')) {
    return
  }

  loadingForgot.value = true
  forgotMessage.value = ''

  try {
    await $fetch('/auth/forgot-password', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      body: {
        email: forgotEmail.value
      }
    })

    forgotMessage.value = 'Un email de réinitialisation a été envoyé si cette adresse existe dans notre système.'

    setTimeout(() => {
      showForgotPassword.value = false
      forgotEmail.value = ''
      forgotMessage.value = ''
    }, 3000)

  } catch (error) {
    console.error('Erreur mot de passe oublié:', error)
    forgotMessage.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    loadingForgot.value = false
  }
}

onMounted(() => {
  const emailInput = document.getElementById('email')
  if (emailInput) {
    emailInput.focus()
  }
})

// Gestion des raccourcis clavier
onMounted(() => {
  const handleKeydown = (e) => {
    // Ctrl/Cmd + Enter pour soumettre
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleLogin()
    }
    // Escape pour fermer le modal
    if (e.key === 'Escape' && showForgotPassword.value) {
      showForgotPassword.value = false
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>