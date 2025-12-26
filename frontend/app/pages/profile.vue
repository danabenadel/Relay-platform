<!-- pages/profile.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <!-- Skip Links -->
    <SkipLinks />

    <!-- Navigation -->
    <nav role="navigation" aria-label="Navigation principale" class="bg-white/10 backdrop-blur-xl border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" aria-label="Retour à l'accueil Relay" class="flex items-center space-x-3 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded">
            <span class="text-2xl font-bold text-white">Relay</span>
          </NuxtLink>
          <div class="flex space-x-2 items-center">
            <ColorblindSelector />
            <NuxtLink
              to="/dashboard"
              aria-label="Aller au tableau de bord"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:view-dashboard" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/services"
              aria-label="Aller aux services"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:puzzle-piece" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Services
            </NuxtLink>
            <NuxtLink
              to="/areas"
              aria-label="Aller aux automatisations"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:lightning-bolt" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              AREAs
            </NuxtLink>
            <NuxtLink
              to="/profile"
              aria-label="Profil (page actuelle)"
              aria-current="page"
              class="text-white px-4 py-2 rounded-lg bg-white/20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:account" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Profil
            </NuxtLink>
            <button
              @click="logout"
              aria-label="Se déconnecter de l'application"
              class="text-red-300 hover:text-red-200 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/30 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:logout" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header role="banner" class="bg-white/5 backdrop-blur-sm border-b border-white/10 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-4xl font-bold text-white mb-2">Mon Profil</h1>
        <p class="text-blue-200 text-lg">
          Gérez vos informations personnelles et préférences
        </p>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" role="status" aria-live="polite" class="max-w-4xl mx-auto px-4 py-12 text-center">
      <Icon name="mdi:loading" aria-hidden="true" class="w-12 h-12 text-white/50 animate-spin mx-auto mb-4" />
      <p class="text-white/70">Chargement de votre profil...</p>
    </div>

    <!-- Contenu principal -->
    <main v-else id="main-content" role="main" class="max-w-4xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne gauche - Avatar et infos -->
        <div class="lg:col-span-1">
          <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <!-- Avatar -->
            <div class="text-center mb-6">
              <div class="relative w-32 h-32 mx-auto mb-4 group">
                <!-- Photo de profil ou icône par défaut -->
                <div
                  v-if="profileImage"
                  class="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-xl"
                >
                  <img
                    :src="profileImage"
                    :alt="`Photo de profil de ${user.name || user.email}`"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  v-else
                  class="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-white/20 shadow-xl"
                  role="img"
                  :aria-label="`Avatar par défaut pour ${user.name || user.email}`"
                >
                  <Icon name="mdi:account" aria-hidden="true" class="w-16 h-16 text-white" />
                </div>

                <!-- Overlay avec boutons au survol -->
                <div class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2" aria-hidden="true">
                  <!-- Bouton upload -->
                  <label
                    for="profile-image-upload"
                    class="cursor-pointer w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label="Changer la photo de profil"
                  >
                    <Icon name="mdi:camera" aria-hidden="true" class="w-5 h-5 text-white" />
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    @change="handleImageUpload"
                    aria-label="Sélectionner une nouvelle photo de profil"
                    class="hidden"
                  />

                  <!-- Bouton supprimer (si une image existe) -->
                  <button
                    v-if="profileImage"
                    @click="removeProfileImage"
                    aria-label="Supprimer la photo de profil"
                    class="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <Icon name="mdi:delete" aria-hidden="true" class="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <h3 class="text-xl font-bold text-white mb-1">
                {{ user.name || user.email }}
              </h3>
              <p class="text-sm text-white/60">{{ user.email }}</p>
              <p v-if="user.createdAt" class="text-xs text-white/50 mt-2">
                Membre depuis {{ formatDate(user.createdAt) }}
              </p>
            </div>

            <!-- Stats calculées depuis les vraies données -->
            <div role="region" aria-label="Statistiques du profil" class="space-y-3">
              <div class="p-3 bg-white/5 rounded-xl border border-white/10">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-white/70">Services connectés</span>
                  <span class="text-lg font-bold text-blue-400">{{ stats.connectedServices }}</span>
                </div>
              </div>
              <div class="p-3 bg-white/5 rounded-xl border border-white/10">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-white/70">AREAs actives</span>
                  <span class="text-lg font-bold text-green-400">{{ stats.activeAreas }}</span>
                </div>
              </div>
              <div class="p-3 bg-white/5 rounded-xl border border-white/10">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-white/70">Total AREAs</span>
                  <span class="text-lg font-bold text-purple-400">{{ stats.totalAreas }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Services OAuth connectés -->
          <div v-if="connectedOAuthServices.length > 0" class="mt-6 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center">
              <Icon name="mdi:link-variant" aria-hidden="true" class="w-5 h-5 mr-2" />
              Services OAuth
            </h3>
            <div role="list" aria-label="Services OAuth connectés" class="space-y-2">
              <div
                v-for="service in connectedOAuthServices"
                :key="service"
                role="listitem"
                class="flex items-center justify-between p-2 bg-white/5 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <Icon :name="getServiceIcon(service)" aria-hidden="true" class="w-5 h-5 text-white" />
                  <span class="text-sm text-white capitalize">{{ service }}</span>
                </div>
                <Icon name="mdi:check-circle" aria-hidden="true" class="w-4 h-4 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite - Formulaire -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informations personnelles -->
          <section role="region" aria-labelledby="personal-info-title" class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 id="personal-info-title" class="text-xl font-bold text-white mb-6 flex items-center">
              <Icon name="mdi:account-edit" aria-hidden="true" class="w-5 h-5 mr-2" />
              Informations personnelles
            </h2>

            <form @submit.prevent="updateProfile" aria-label="Formulaire de modification du profil" class="space-y-6">
              <!-- Nom -->
              <div>
                <label for="name-input" class="block text-sm font-medium text-white mb-2">
                  Nom
                </label>
                <input
                  id="name-input"
                  v-model="form.name"
                  type="text"
                  placeholder="Entrez votre nom"
                  :aria-invalid="!!errors.name"
                  :aria-describedby="errors.name ? 'name-error' : undefined"
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" id="name-error" role="alert" aria-live="assertive" class="text-red-400 text-sm mt-1">
                  <span aria-hidden="true">⚠️</span>{{ errors.name }}
                </p>
              </div>

              <!-- Email (read-only) -->
              <div>
                <label for="email-input" class="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  id="email-input"
                  :value="user.email"
                  type="email"
                  disabled
                  aria-label="Adresse email (non modifiable)"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                />
                <p class="text-xs text-white/50 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <!-- Messages -->
              <div v-if="successMessage" role="status" aria-live="polite" class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:check-circle" aria-hidden="true" class="w-5 h-5 text-green-300" />
                  <span class="text-green-300">{{ successMessage }}</span>
                </div>
              </div>

              <div v-if="errorMessage" role="alert" aria-live="assertive" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:alert-circle" aria-hidden="true" class="w-5 h-5 text-red-300" />
                  <span class="text-red-300">{{ errorMessage }}</span>
                </div>
              </div>

              <!-- Boutons -->
              <div class="flex gap-3">
                <button
                  type="submit"
                  :disabled="saving || !hasChanges"
                  :aria-busy="saving"
                  aria-label="Enregistrer les modifications du profil"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <Icon
                    :name="saving ? 'mdi:loading' : 'mdi:content-save'"
                    aria-hidden="true"
                    :class="['w-5 h-5 inline mr-2', saving ? 'animate-spin' : '']"
                  />
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
                <button
                  type="button"
                  @click="resetForm"
                  :disabled="saving || !hasChanges"
                  aria-label="Réinitialiser le formulaire"
                  class="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <Icon name="mdi:refresh" aria-hidden="true" class="w-5 h-5 inline mr-2" />
                  Réinitialiser
                </button>
              </div>
            </form>
          </section>

          <!-- Sécurité -->
          <section role="region" aria-labelledby="security-title" class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 id="security-title" class="text-xl font-bold text-white mb-6 flex items-center">
              <Icon name="mdi:shield-lock" aria-hidden="true" class="w-5 h-5 mr-2" />
              Sécurité
            </h2>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h3 class="text-white font-medium mb-1">Mot de passe</h3>
                  <p class="text-sm text-white/60">Modifiez votre mot de passe</p>
                </div>
                <button
                  aria-label="Modifier le mot de passe"
                  class="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  Modifier
                </button>
              </div>

              <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <h3 class="text-white font-medium mb-1">Sessions actives</h3>
                  <p class="text-sm text-white/60">Gérez vos sessions et déconnectez-vous des appareils</p>
                </div>
                <button
                  aria-label="Voir les sessions actives"
                  class="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  Voir
                </button>
              </div>
            </div>
          </section>

          <!-- Danger Zone -->
          <section role="region" aria-labelledby="danger-zone-title" class="bg-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
            <h2 id="danger-zone-title" class="text-xl font-bold text-red-300 mb-4 flex items-center">
              <Icon name="mdi:alert" aria-hidden="true" class="w-5 h-5 mr-2" />
              Zone dangereuse
            </h2>

            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-white font-medium mb-1">Supprimer le compte</h3>
                  <p class="text-sm text-white/60">
                    Suppression définitive de votre compte et de toutes vos données
                  </p>
                </div>
                <button
                  @click="showDeleteModal = true"
                  aria-label="Supprimer définitivement le compte"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Modal de confirmation de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-slate-800 rounded-2xl p-6 max-w-md mx-4 border border-red-500/30" @click.stop>
          <h3 id="delete-modal-title" class="text-xl font-bold text-white mb-3 flex items-center">
            <Icon name="mdi:alert" aria-hidden="true" class="w-6 h-6 text-red-400 mr-2" />
            Supprimer le compte ?
          </h3>
          <p class="text-white/70 mb-4">
            Cette action est irréversible. Toutes vos données seront définitivement supprimées :
          </p>
          <ul class="text-sm text-white/60 mb-6 space-y-2" role="list">
            <li class="flex items-center gap-2" role="listitem">
              <Icon name="mdi:close" aria-hidden="true" class="w-4 h-4 text-red-400" />
              Tous vos services connectés
            </li>
            <li class="flex items-center gap-2" role="listitem">
              <Icon name="mdi:close" aria-hidden="true" class="w-4 h-4 text-red-400" />
              Toutes vos AREAs
            </li>
            <li class="flex items-center gap-2" role="listitem">
              <Icon name="mdi:close" aria-hidden="true" class="w-4 h-4 text-red-400" />
              Tout l'historique d'exécutions
            </li>
          </ul>
          <div class="flex gap-3">
            <button
              @click="deleteAccount"
              :disabled="deleting"
              :aria-busy="deleting"
              aria-label="Confirmer la suppression du compte"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {{ deleting ? 'Suppression...' : 'Confirmer la suppression' }}
            </button>
            <button
              @click="showDeleteModal = false"
              :disabled="deleting"
              aria-label="Annuler la suppression"
              class="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// Protection de la page - nécessite authentification
definePageMeta({
  middleware: 'auth'
});

// Configuration
useHead({
  title: "Mon Profil - Relay",
  meta: [{ name: "description", content: "Gérez votre profil et vos préférences" }],
});

const config = useRuntimeConfig();

// État
const loading = ref(true);
const user = ref({
  email: "",
  name: "",
  createdAt: null,
});

const originalUser = ref({});
const areas = ref([]);
const oauthTokens = ref([]);

// Statistiques calculées depuis les vraies données
const stats = computed(() => {
  const uniqueServices = new Set();

  areas.value.forEach(area => {
    if (area.action?.service?.name) {
      uniqueServices.add(area.action.service.name);
    }
    if (area.reaction?.service?.name) {
      uniqueServices.add(area.reaction.service.name);
    }
  });

  // Ajouter les services OAuth connectés
  oauthTokens.value.forEach(token => {
    uniqueServices.add(token.serviceName);
  });

  return {
    connectedServices: uniqueServices.size,
    activeAreas: areas.value.filter(a => a.isActive).length,
    totalAreas: areas.value.length,
  };
});

// Services OAuth connectés
const connectedOAuthServices = computed(() => {
  return [...new Set(oauthTokens.value.map(t => t.serviceName))];
});

const form = ref({
  name: "",
});

const errors = ref({
  name: "",
});

const successMessage = ref("");
const errorMessage = ref("");
const saving = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);
const profileImage = ref("");

// Icônes des services
const serviceIcons = {
  gmail: "mdi:gmail",
  google: "mdi:google",
  outlook: "mdi:microsoft-outlook",
  slack: "mdi:slack",
  discord: "mdi:discord",
  github: "mdi:github",
  onedrive: "mdi:microsoft-onedrive",
  dropbox: "mdi:dropbox",
  facebook: "mdi:facebook",
  instagram: "mdi:instagram",
  twitter: "mdi:twitter",
  x: "mdi:twitter",
  timer: "mdi:timer",
  console: "mdi:console",
  spotify: "mdi:spotify",
  reddit: "mdi:reddit",
  notion: "simple-icons:notion",
};

// Computed
const hasChanges = computed(() => {
  return form.value.name !== originalUser.value.name;
});

// Méthodes
const getServiceIcon = (serviceName) => {
  return serviceIcons[serviceName?.toLowerCase()] || "mdi:puzzle";
};

const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const loadUserData = async () => {
  loading.value = true;

  try {
    // Charger le profil utilisateur
    const profileResponse = await $fetch("/auth/profile", {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    if (profileResponse.success) {
      user.value = profileResponse.data;
      originalUser.value = { ...profileResponse.data };
      form.value.name = profileResponse.data.name || "";
    }

    // Charger les AREAs pour calculer les stats
    const areasResponse = await $fetch("/api/areas", {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    if (areasResponse.success) {
      areas.value = areasResponse.data || [];
    }

    // Charger les tokens OAuth pour connaître les services connectés
    const tokensResponse = await $fetch("/auth/oauth/tokens", {
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    }).catch(() => ({ success: false, data: [] }));

    if (tokensResponse.success) {
      oauthTokens.value = tokensResponse.data || [];
    }

  } catch (error) {
    console.error("Erreur lors du chargement du profil:", error);
    errorMessage.value = "Erreur lors du chargement du profil";
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (form.value.name && form.value.name.length > 100) {
    errors.value.name = "Le nom ne peut pas dépasser 100 caractères";
    isValid = false;
  }

  return isValid;
};

const updateProfile = async () => {
  if (!validateForm()) return;

  saving.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const updatedUser = await $fetch("/auth/profile", {
      method: "PUT",
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
      body: {
        name: form.value.name,
      },
    });

    if (updatedUser.success) {
      user.value = updatedUser.data;
      originalUser.value = { ...updatedUser.data };
      successMessage.value = "Profil mis à jour avec succès !";

      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    errorMessage.value = "Erreur lors de la mise à jour du profil";
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  form.value.name = originalUser.value.name || "";
  errors.value = {};
  successMessage.value = "";
  errorMessage.value = "";
};

const deleteAccount = async () => {
  deleting.value = true;

  try {
    await $fetch("/auth/account", {
      method: "DELETE",
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    // Supprimer le token et rediriger
    useCookie("auth-token").value = null;
    navigateTo("/");
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    errorMessage.value = "Erreur lors de la suppression du compte";
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

// Gestion de la photo de profil
const loadProfileImage = () => {
  if (process.client) {
    const savedImage = localStorage.getItem("relay-profile-image");
    if (savedImage) {
      profileImage.value = savedImage;
    }
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Vérifier le type de fichier
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    errorMessage.value = "Format d'image non supporté. Utilisez JPG, PNG ou WEBP.";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return;
  }

  // Vérifier la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errorMessage.value = "L'image est trop volumineuse. Taille maximale : 5MB.";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return;
  }

  // Convertir en Base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Image = e.target?.result;
    if (base64Image && typeof base64Image === "string") {
      // Stocker dans localStorage
      try {
        localStorage.setItem("relay-profile-image", base64Image);
        profileImage.value = base64Image;
        successMessage.value = "Photo de profil mise à jour !";
        setTimeout(() => {
          successMessage.value = "";
        }, 3000);
      } catch (error) {
        console.error("Erreur lors du stockage de l'image:", error);
        errorMessage.value = "Erreur lors du stockage de l'image. Essayez une image plus petite.";
        setTimeout(() => {
          errorMessage.value = "";
        }, 3000);
      }
    }
  };

  reader.onerror = () => {
    errorMessage.value = "Erreur lors de la lecture de l'image.";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  };

  reader.readAsDataURL(file);

  // Réinitialiser l'input pour permettre de re-upload la même image
  event.target.value = "";
};

const removeProfileImage = () => {
  if (process.client) {
    localStorage.removeItem("relay-profile-image");
    profileImage.value = "";
    successMessage.value = "Photo de profil supprimée !";
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  }
};

// Déconnexion
const logout = () => {
  // Supprimer le token d'authentification
  useCookie("auth-token").value = null;

  // Rediriger vers la page d'accueil
  navigateTo("/");
};

// Lifecycle
onMounted(() => {
  loadUserData();
  loadProfileImage();
});
</script>
