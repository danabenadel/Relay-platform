<!-- app/pages/register.vue -->
<template>
  <div
    class="relay-bg-gradient min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4"
  >
    <SkipLinks />

    <!-- Background animated elements -->
    <div class="absolute inset-0" aria-hidden="true">
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"
      ></div>
    </div>

    <main id="main-content" role="main" class="relative z-10 max-w-md w-full">
      <!-- Header avec logo -->
      <header class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-2">
          <NuxtLink
            to="/"
            class="text-white/70 hover:text-white transition-colors group focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
            aria-label="Retour à l'accueil"
          >
            <Icon name="mdi:arrow-left" class="w-6 h-6 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          </NuxtLink>
          <h1 class="text-3xl font-bold relay-text-white">Créer un compte</h1>
          <ColorblindSelector />
        </div>
        <p class="relay-text-primary">
          Rejoignez la révolution de l'automatisation
        </p>
      </header>

      <!-- Formulaire principal -->
      <section
        class="relay-card rounded-3xl shadow-2xl p-8 relative overflow-hidden"
        role="region"
        aria-labelledby="register-form-title"
      >
        <!-- Gradient overlay subtil -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"
          aria-hidden="true"
        ></div>

        <div class="relative z-10">
          <h2 id="register-form-title" class="sr-only">Formulaire d'inscription</h2>
          <form @submit.prevent="handleRegister" class="space-y-6" aria-label="Formulaire de création de compte">
            <!-- Email -->
            <div class="space-y-2">
              <label
                for="email"
                class="block text-sm font-medium relay-text-white"
              >
                Adresse email
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="votre@email.com"
                class="w-full px-4 py-3 relay-bg-glass relay-border-glass rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 relay-text-white placeholder-white/50 hover:relay-bg-glass-hover"
                :class="{ 'border-red-500 focus:ring-red-500': errors.email }"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'email-error' : undefined"
                aria-label="Adresse email"
              />
              <p
                v-if="errors.email"
                id="email-error"
                class="text-red-400 text-sm flex items-center"
                role="alert"
                aria-live="assertive"
              >
                <span class="mr-1" aria-hidden="true">⚠️</span>{{ errors.email }}
              </p>
            </div>

            <!-- Mot de passe -->
            <div class="space-y-2">
              <label
                for="password"
                class="block text-sm font-medium relay-text-white"
              >
                Mot de passe
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-3 pr-12 relay-bg-glass relay-border-glass rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 relay-text-white placeholder-white/50 hover:relay-bg-glass-hover"
                  :class="{
                    'border-red-500 focus:ring-red-500': errors.password,
                  }"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="errors.password ? 'password-error password-strength' : 'password-strength'"
                  aria-label="Mot de passe"
                />
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
              <!-- Indicateur de force du mot de passe -->
              <div class="mt-2" role="status" aria-live="polite">
                <div class="flex space-x-1" aria-hidden="true">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-colors duration-300"
                    :class="getPasswordStrengthColor(i)"
                  ></div>
                </div>
                <p id="password-strength" class="text-xs text-white/70 mt-1">
                  Force du mot de passe: {{ passwordStrengthText }}
                </p>
              </div>
              <p
                v-if="errors.password"
                id="password-error"
                class="text-red-400 text-sm flex items-center"
                role="alert"
                aria-live="assertive"
              >
                <span class="mr-1" aria-hidden="true">⚠️</span>{{ errors.password }}
              </p>
            </div>

            <!-- Confirmation mot de passe -->
            <div class="space-y-2">
              <label
                for="confirmPassword"
                class="block text-sm font-medium relay-text-white"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3 relay-bg-glass relay-border-glass rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 relay-text-white placeholder-white/50 hover:relay-bg-glass-hover"
                :class="{
                  'border-red-500 focus:ring-red-500': errors.confirmPassword,
                }"
                :aria-invalid="!!errors.confirmPassword"
                :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : undefined"
                aria-label="Confirmer le mot de passe"
              />
              <p
                v-if="errors.confirmPassword"
                id="confirm-password-error"
                class="text-red-400 text-sm flex items-center"
                role="alert"
                aria-live="assertive"
              >
                <span class="mr-1" aria-hidden="true">⚠️</span>{{ errors.confirmPassword }}
              </p>
            </div>

            <!-- Conditions d'utilisation -->
            <div class="flex items-start space-x-3">
              <input
                id="terms"
                v-model="form.acceptTerms"
                type="checkbox"
                class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 focus:outline-none relay-border-glass rounded relay-bg-glass"
                :aria-invalid="!!errors.acceptTerms"
                :aria-describedby="errors.acceptTerms ? 'terms-error' : undefined"
              />
              <label for="terms" class="text-sm relay-text-secondary leading-relaxed">
                J'accepte les
                <a
                  href="#"
                  class="relay-text-muted hover:relay-text-primary underline focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  aria-label="Lire les conditions d'utilisation"
                  >conditions d'utilisation</a
                >
                et la
                <a
                  href="#"
                  class="relay-text-muted hover:relay-text-primary underline focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  aria-label="Lire la politique de confidentialité"
                  >politique de confidentialité</a
                >
              </label>
            </div>
            <p
              v-if="errors.acceptTerms"
              id="terms-error"
              class="text-red-400 text-sm flex items-center"
              role="alert"
              aria-live="assertive"
            >
              <span class="mr-1" aria-hidden="true">⚠️</span>{{ errors.acceptTerms }}
            </p>

            <!-- Bouton de création de compte -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              :aria-busy="loading"
              class="w-full group relay-btn-primary py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Créer mon compte"
            >
              <span v-if="loading" class="inline-flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Création en cours...
              </span>
              <span
                v-else
                class="relative z-10 flex items-center justify-center"
              >
                Créer mon compte
                <svg
                  class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
              ></div>
            </button>

            <!-- Message d'erreur global -->
            <div
              v-if="errors.global"
              class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
              role="alert"
              aria-live="assertive"
            >
              <p class="text-red-300 text-sm flex items-center">
                <span class="mr-2 text-lg" aria-hidden="true">🚨</span>{{ errors.global }}
              </p>
            </div>

            <!-- Message de succès -->
            <div
              v-if="successMessage"
              class="bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
              role="status"
              aria-live="polite"
            >
              <p class="text-green-300 text-sm flex items-center">
                <span class="mr-2 text-lg" aria-hidden="true">✅</span>{{ successMessage }}
              </p>
            </div>
          </form>

          <!-- Lien de connexion -->
          <nav class="mt-8 text-center" aria-label="Navigation vers la connexion">
            <p class="relay-text-secondary">
              Vous avez déjà un compte ?
              <NuxtLink
                to="/login"
                class="font-medium relay-text-muted hover:relay-text-primary underline ml-1 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                aria-label="Se connecter à votre compte existant"
              >
                Se connecter
              </NuxtLink>
            </p>
          </nav>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// Configuration de la page
definePageMeta({
  layout: false,
});

useHead({
  title: "Créer un compte - Relay",
  meta: [
    {
      name: "description",
      content:
        "Créez votre compte Relay et commencez à automatiser vos tâches quotidiennes",
    },
  ],
});

// État réactif
const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

const loading = ref(false);
const showPassword = ref(false);
const successMessage = ref("");

const errors = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: "",
  global: "",
});

// Configuration
const config = useRuntimeConfig();

// Computed
const isFormValid = computed(() => {
  return (
    form.email.includes("@") &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.acceptTerms
  );
});

const passwordStrength = computed(() => {
  if (!form.password) return 0;
  let strength = 0;
  if (form.password.length >= 8) strength++;
  if (/[A-Z]/.test(form.password)) strength++;
  if (/[0-9]/.test(form.password)) strength++;
  if (/[^A-Za-z0-9]/.test(form.password)) strength++;
  return strength;
});

const passwordStrengthText = computed(() => {
  const texts = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  return texts[passwordStrength.value] || "Entrez un mot de passe";
});

// Méthodes
const getPasswordStrengthColor = (index) => {
  if (passwordStrength.value >= index) {
    if (passwordStrength.value <= 1) return "bg-red-500";
    if (passwordStrength.value <= 2) return "bg-yellow-500";
    if (passwordStrength.value <= 3) return "bg-blue-500";
    return "bg-green-500";
  }
  return "bg-white/20";
};

const validateForm = () => {
  // Reset des erreurs
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  let isValid = true;

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email) {
    errors.email = "L'email est requis";
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Format d'email invalide";
    isValid = false;
  }

  // Validation mot de passe
  if (!form.password) {
    errors.password = "Le mot de passe est requis";
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    isValid = false;
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
    isValid = false;
  }

  // Validation confirmation mot de passe
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
    isValid = false;
  }

  // Validation conditions d'utilisation
  if (!form.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  errors.global = "";

  try {
    // Appel API d'inscription
    const response = await $fetch("/auth/register", {
      method: "POST",
      baseURL: config.public.apiBaseUrl,
      body: {
        email: form.email,
        password: form.password,
      },
    });

    // Le backend renvoie { success: true, data: { token, user } }
    if (!response.success) {
      throw new Error(response.error || 'Erreur lors de l\'inscription')
    }

    // Succès
    successMessage.value = "Votre compte a été créé avec succès !";

    // Connexion automatique après inscription
    const token = useCookie("auth-token", {
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
    });

    const user = useCookie("user-data", {
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
    });

    token.value = response.data.token;
    user.value = response.data.user;

    // Redirection après 2 secondes
    setTimeout(() => {
      navigateTo("/dashboard");
    }, 2000);
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);

    // Gestion des erreurs spécifiques
    if (error.status === 409) {
      errors.global = error.data?.error || "Cette adresse email est déjà utilisée";
    } else if (error.status === 400) {
      errors.global = error.data?.error || "Données invalides. Vérifiez les informations saisies.";
    } else if (error.status >= 500) {
      errors.global = "Erreur serveur. Veuillez réessayer plus tard.";
    } else {
      errors.global =
        error.data?.error || error.message || "Une erreur est survenue lors de l'inscription";
    }
  } finally {
    loading.value = false;
  }
};


// Auto-focus sur le champ email au montage
onMounted(() => {
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.focus();
  }
});
</script>
