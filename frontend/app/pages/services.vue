<!-- pages/services.vue -->
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
              aria-label="Services (page actuelle)"
              aria-current="page"
              class="text-white px-4 py-2 rounded-lg bg-white/20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              aria-label="Aller au profil"
              class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon name="mdi:account" aria-hidden="true" class="w-4 h-4 inline mr-2" />
              Profil
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <header role="banner" class="bg-white/5 backdrop-blur-sm border-b border-white/10 py-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-4xl font-bold text-white mb-2">Services</h1>
            <p class="text-blue-200 text-lg">
              Connectez des services pour créer des automatisations
            </p>
          </div>
        </div>

        <!-- Statistiques -->
        <div role="region" aria-label="Statistiques des services" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <div class="text-2xl font-bold text-white">{{ connectedServicesCount }}</div>
            <div class="text-sm text-blue-200">Services connectés</div>
          </div>
          <div class="bg-gradient-to-br from-green-600/20 to-green-700/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <div class="text-2xl font-bold text-white">{{ availableOAuthServices.length }}</div>
            <div class="text-sm text-green-200">Services disponibles</div>
          </div>
          <div class="bg-gradient-to-br from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <div class="text-2xl font-bold text-white">{{ totalAreasUsingServices }}</div>
            <div class="text-sm text-purple-200">AREAs utilisant ces services</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" role="status" aria-live="polite" class="max-w-7xl mx-auto px-4 py-12 text-center">
      <Icon name="mdi:loading" aria-hidden="true" class="w-12 h-12 text-white/50 animate-spin mx-auto mb-4" />
      <p class="text-white/70">Chargement des services...</p>
    </div>

    <!-- Contenu principal -->
    <main v-else id="main-content" role="main" class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <!-- Services connectés -->
      <section v-if="connectedServicesData.length > 0" role="region" aria-labelledby="connected-services-title">
        <div class="flex items-center justify-between mb-6">
          <h2 id="connected-services-title" class="text-2xl font-bold text-white flex items-center">
            <Icon name="mdi:check-circle" aria-hidden="true" class="w-6 h-6 mr-2 text-green-400" />
            Services connectés
          </h2>
          <span class="text-sm text-white/60">{{ connectedServicesData.length }} service(s)</span>
        </div>

        <div role="list" aria-label="Liste des services connectés" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="service in connectedServicesData"
            :key="service.name"
            role="listitem"
            class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-green-500/30 transition-all"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-green-500/20 rounded-xl" aria-hidden="true">
                  <Icon :name="getServiceIcon(service.name)" aria-hidden="true" class="w-8 h-8 text-green-300" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white capitalize">{{ service.name }}</h3>
                  <p class="text-xs text-white/60">Connecté</p>
                </div>
              </div>
              <div class="flex items-center gap-1" aria-label="Service actif">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
              </div>
            </div>

            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-white/70">AREAs utilisant ce service</span>
                <span class="text-white font-medium">{{ service.areasCount }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-white/70">Actions disponibles</span>
                <span class="text-white font-medium">{{ service.actionsCount }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-white/70">Réactions disponibles</span>
                <span class="text-white font-medium">{{ service.reactionsCount }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="viewServiceAreas(service)"
                aria-label="Voir les AREAs utilisant ${service.name}"
                class="flex-1 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon name="mdi:lightning-bolt" aria-hidden="true" class="w-4 h-4 inline mr-1" />
                Voir les AREAs
              </button>
              <button
                @click="disconnectService(service)"
                :aria-label="`Déconnecter le service ${service.name}`"
                class="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-all text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon name="mdi:link-off" aria-hidden="true" class="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Divider si on a des services connectés ET disponibles -->
      <div v-if="connectedServicesData.length > 0 && availableOAuthServices.length > 0" class="relative" aria-hidden="true">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-white/20" />
        </div>
        <div class="relative flex justify-center">
          <span class="px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white/70 text-sm">
            Services disponibles
          </span>
        </div>
      </div>

      <!-- Services disponibles (OAuth uniquement) -->
      <section role="region" aria-labelledby="available-services-title">
        <div class="flex items-center justify-between mb-6">
          <h2 id="available-services-title" class="text-2xl font-bold text-white flex items-center">
            <Icon name="mdi:puzzle-piece-plus" aria-hidden="true" class="w-6 h-6 mr-2 text-blue-400" />
            {{ connectedServicesData.length > 0 ? 'Autres services disponibles' : 'Services disponibles' }}
          </h2>
          <span class="text-sm text-white/60">{{ availableOAuthServices.length }} service(s) OAuth</span>
        </div>

        <div v-if="availableOAuthServices.length > 0" role="list" aria-label="Liste des services disponibles" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="service in availableOAuthServices"
            :key="service.name"
            role="listitem"
            class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-blue-500/30 transition-all group"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-all" aria-hidden="true">
                  <Icon :name="getServiceIcon(service.name)" aria-hidden="true" class="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white capitalize">{{ service.name }}</h3>
                  <p class="text-xs text-white/60">Non connecté</p>
                </div>
              </div>
            </div>

            <p class="text-sm text-white/70 mb-4 line-clamp-2">
              {{ service.description }}
            </p>

            <div class="space-y-2 mb-4">
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/60">Actions</span>
                <span class="text-white font-medium">{{ service.actionsCount }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/60">Réactions</span>
                <span class="text-white font-medium">{{ service.reactionsCount }}</span>
              </div>
            </div>

            <button
              @click="handleConnectService(service)"
              :disabled="connectingService === service.name"
              :aria-label="`Connecter le service ${service.name}`"
              :aria-busy="connectingService === service.name"
              class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon
                :name="connectingService === service.name ? 'mdi:loading' : 'mdi:link-plus'"
                aria-hidden="true"
                :class="['w-4 h-4 inline mr-2', connectingService === service.name ? 'animate-spin' : '']"
              />
              {{ connectingService === service.name ? 'Connexion...' : 'Connecter' }}
            </button>
          </article>
        </div>

        <div v-else role="status" aria-live="polite" class="text-center py-12">
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
            <Icon name="mdi:check-all" aria-hidden="true" class="w-16 h-16 mx-auto text-green-400 mb-4" />
            <h3 class="text-xl font-semibold text-white mb-2">
              Tous les services sont connectés !
            </h3>
            <p class="text-white/70">
              Vous avez connecté tous les services OAuth disponibles.
            </p>
          </div>
        </div>
      </section>

      <!-- Services bot (Telegram, etc.) -->
      <section v-if="botServices.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white flex items-center">
            <Icon name="mdi:robot-excited-outline" class="w-6 h-6 mr-2 text-purple-400" />
            Services bot
          </h2>
          <span class="text-sm text-white/60">{{ botServices.length }} service(s)</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="service in botServices"
            :key="service.name"
            class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-500/30 transition-all"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-3 bg-purple-500/20 rounded-xl">
                  <Icon :name="getServiceIcon(service.name)" class="w-8 h-8 text-purple-300" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white capitalize">{{ service.name }}</h3>
                  <p class="text-xs text-white/60">Automatisations via bot</p>
                </div>
              </div>
            </div>

            <p class="text-sm text-white/70 mb-4">
              {{ service.description }}
            </p>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p class="text-xs text-white/50">Actions</p>
                <p class="text-lg font-semibold text-white">{{ service.actionsCount }}</p>
              </div>
              <div class="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p class="text-xs text-white/50">Réactions</p>
                <p class="text-lg font-semibold text-white">{{ service.reactionsCount }}</p>
              </div>
            </div>

            <template v-if="service.name.toLowerCase() === 'telegram'">
              <div v-if="telegramSuccess" class="mb-4 bg-green-500/15 border border-green-500/30 text-green-200 text-sm rounded-xl p-3 flex items-start gap-2">
                <Icon name="mdi:check-circle" class="w-5 h-5 mt-0.5" />
                <p>{{ telegramSuccess }}</p>
              </div>

              <div v-if="telegramError" class="mb-4 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl p-3 flex items-start gap-2">
                <Icon name="mdi:alert-circle" class="w-5 h-5 mt-0.5" />
                <p>{{ telegramError }}</p>
              </div>

              <div v-if="telegramStatusLoading" class="mb-4 bg-white/5 border border-white/10 text-white/70 rounded-xl p-3 flex items-center gap-2">
                <Icon name="mdi:loading" class="w-5 h-5 animate-spin" />
                <span>Chargement du statut du bot...</span>
              </div>

              <template v-else>
                <div
                  class="mb-4 rounded-xl border p-4"
                  :class="hasTelegramConfigured ? 'border-green-500/40 bg-green-500/10' : 'border-white/20 bg-white/5'"
                >
                  <div class="flex items-start gap-3">
                    <div :class="['p-2 rounded-lg', hasTelegramConfigured ? 'bg-green-500/20' : 'bg-white/10']">
                      <Icon
                        :name="hasTelegramConfigured ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'"
                        :class="['w-6 h-6', hasTelegramConfigured ? 'text-green-300' : 'text-white/60']"
                      />
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm font-semibold" :class="hasTelegramConfigured ? 'text-green-200' : 'text-white'">
                        {{ hasTelegramConfigured ? 'Bot configuré' : 'Bot non configuré' }}
                      </p>
                      <p v-if="hasTelegramConfigured && telegramStatus.displayName" class="text-sm text-white/80">
                        {{ telegramStatus.displayName }}
                        <span v-if="telegramStatus.botId" class="text-white/60"> • ID {{ telegramStatus.botId }}</span>
                      </p>
                      <p v-if="!hasTelegramConfigured" class="text-sm text-white/60">
                        Renseignez votre token BotFather pour activer les actions et réactions Telegram.
                      </p>
                      <p v-if="telegramLastUpdated" class="text-xs text-white/50">
                        Dernière mise à jour : {{ telegramLastUpdated }}
                      </p>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="handleTelegramConfigure" class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-white/80 block mb-2" for="telegram-token">Token BotFather</label>
                    <input
                      id="telegram-token"
                      v-model="telegramTokenInput"
                      type="text"
                      autocomplete="off"
                      placeholder="123456789:AA-XXXXXXXXXXXXXXX"
                      class="w-full px-4 py-3 bg-white/5 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40 rounded-xl text-white placeholder:text-white/30 transition-all"
                    />
                    <p class="text-xs text-white/40 mt-2">
                      Pour obtenir ce token, conversez avec @BotFather sur Telegram et utilisez la commande <code>/token</code>.
                    </p>
                  </div>

                  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <label v-if="hasTelegramConfigured" class="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        v-model="telegramForceOverwrite"
                        class="w-4 h-4 rounded border-white/40 bg-white/5 text-purple-400 focus:ring-purple-400/60"
                      />
                      <span>Forcer la mise à jour du bot existant</span>
                    </label>
                    <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <button
                        type="submit"
                        :disabled="telegramSaving || telegramTokenInput.trim().length === 0"
                        class="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-white flex items-center justify-center gap-2"
                      >
                        <Icon
                          :name="telegramSaving ? 'mdi:loading' : hasTelegramConfigured ? 'mdi:content-save' : 'mdi:check-bold'"
                          :class="['w-5 h-5', telegramSaving ? 'animate-spin' : '']"
                        />
                        {{ hasTelegramConfigured ? 'Mettre à jour le bot' : 'Enregistrer le bot' }}
                      </button>
                      <button
                        type="button"
                        @click="handleTelegramDisconnect"
                        :disabled="telegramDisconnecting || !hasTelegramConfigured"
                        class="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Icon
                          :name="telegramDisconnecting ? 'mdi:loading' : 'mdi:link-off'"
                          :class="['w-5 h-5', telegramDisconnecting ? 'animate-spin' : '']"
                        />
                        Déconnecter
                      </button>
                    </div>
                  </div>
                </form>
              </template>
            </template>

            <template v-else>
              <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/60">
                <p>Configuration disponible prochainement pour ce service bot.</p>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Services internes (info seulement) -->
      <section v-if="internalServices.length > 0" role="region" aria-labelledby="internal-services-title">
        <div class="flex items-center justify-between mb-6">
            Services internes
            <Icon name="mdi:cog" aria-hidden="true" class="w-6 h-6 mr-2 text-gray-400" />
          <h2 id="internal-services-title" class="text-2xl font-bold text-white flex items-center">
          </h2>
          <span class="text-sm text-white/60">{{ internalServices.length }} service(s)</span>
        </div>

        <div role="list" aria-label="Liste des services internes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="service in internalServices"
            :key="service.name"
            role="listitem"
            class="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <div class="flex items-start gap-3 mb-3">
              <div class="p-3 bg-gray-500/20 rounded-xl" aria-hidden="true">
                <Icon :name="getServiceIcon(service.name)" aria-hidden="true" class="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white capitalize">{{ service.name }}</h3>
                <p class="text-xs text-white/60">Toujours disponible</p>
              </div>
            </div>

            <p class="text-sm text-white/60 mb-4">
              {{ service.description }}
            </p>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/50">Actions</span>
                <span class="text-white/70">{{ service.actionsCount }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/50">Réactions</span>
                <span class="text-white/70">{{ service.reactionsCount }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Modal de confirmation de déconnexion -->
    <Teleport to="body">
      <div
        v-if="showDisconnectModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disconnect-modal-title"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="showDisconnectModal = false"
      >
        <div class="bg-slate-800 rounded-2xl p-6 max-w-md mx-4 border border-white/20" @click.stop>
          <h3 id="disconnect-modal-title" class="text-xl font-bold text-white mb-3 flex items-center">
            <Icon name="mdi:alert" aria-hidden="true" class="w-6 h-6 text-red-400 mr-2" />
            Déconnecter {{ serviceToDisconnect?.name }} ?
          </h3>
          <p class="text-white/70 mb-4">
            Cette action va déconnecter le service. Les AREAs utilisant ce service seront désactivées.
          </p>
          <div v-if="serviceToDisconnect && serviceToDisconnect.areasCount > 0" role="alert" aria-live="assertive" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p class="text-sm text-red-300 font-medium">
              <Icon name="mdi:alert" aria-hidden="true" class="w-4 h-4 inline mr-1" />
              {{ serviceToDisconnect.areasCount }} AREA(s) seront affectée(s)
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="confirmDisconnect"
              :disabled="disconnecting"
              :aria-busy="disconnecting"
              aria-label="Confirmer la déconnexion du service"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Icon
                :name="disconnecting ? 'mdi:loading' : 'mdi:link-off'"
                aria-hidden="true"
                :class="['w-4 h-4 inline mr-1', disconnecting ? 'animate-spin' : '']"
              />
              {{ disconnecting ? 'Déconnexion...' : 'Déconnecter' }}
            </button>
            <button
              @click="showDisconnectModal = false"
              :disabled="disconnecting"
              aria-label="Annuler la déconnexion"
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
definePageMeta({
  middleware: 'auth'
});

// Configuration
useHead({
  title: "Services - Relay",
  meta: [
    { name: "description", content: "Gérez vos services connectés" },
  ],
});

const config = useRuntimeConfig();
const authCookie = useCookie('auth-token');

// État réactif
const loading = ref(true);
const allServices = ref([]);
const connectedOAuthTokens = ref([]);
const userAreas = ref([]);
const connectingService = ref(null);
const showDisconnectModal = ref(false);
const serviceToDisconnect = ref(null);
const disconnecting = ref(false);
const telegramStatus = ref({
  configured: false,
  displayName: null,
  updatedAt: null,
  botId: null
});
const telegramTokenInput = ref('');
const telegramSaving = ref(false);
const telegramError = ref(null);
const telegramSuccess = ref(null);
const telegramStatusLoading = ref(false);
const telegramDisconnecting = ref(false);
const telegramForceOverwrite = ref(false);

// Icônes des services
const serviceIcons = {
  gmail: "mdi:gmail",
  google: "mdi:google",
  outlook: "mdi:microsoft-outlook",
  slack: "mdi:slack",
  discord: "mdi:discord",
  github: "mdi:github",
  gitlab: "mdi:gitlab",
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
  youtube: "mdi:youtube",
  telegram: "mdi:telegram",
  openai: "mdi:robot",
  notion: "simple-icons:notion",
};

const hasTelegramConfigured = computed(() => Boolean(telegramStatus.value.configured));

const telegramLastUpdated = computed(() => {
  if (!telegramStatus.value.updatedAt) {
    return null;
  }

  try {
    const date = new Date(telegramStatus.value.updatedAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date);
  } catch (error) {
    console.error('[Services] Error formatting Telegram date:', error);
    return null;
  }
});

watch(telegramTokenInput, () => {
  telegramError.value = null;
  telegramSuccess.value = null;
});

watch(telegramForceOverwrite, () => {
  telegramError.value = null;
  telegramSuccess.value = null;
});

// Computed - Services OAuth disponibles (ceux qu'on peut connecter)
const availableOAuthServices = computed(() => {
  const connectedNames = connectedOAuthTokens.value.map(t => t.serviceName.toLowerCase());

  return allServices.value
    .filter(service => {
      const type = (service.type || '').toLowerCase();
      const isOAuth = type === 'oauth';
      const notConnected = !connectedNames.includes(service.name.toLowerCase());
      return isOAuth && notConnected;
    })
    .map(service => ({
      name: service.name,
      description: service.description || `Service ${service.name}`,
      type: service.type,
      actionsCount: service.actions?.length || 0,
      reactionsCount: service.reactions?.length || 0,
    }));
});

// Computed - Services connectés avec leurs stats
const connectedServicesData = computed(() => {
  return connectedOAuthTokens.value.map(token => {
    const serviceName = token.serviceName.toLowerCase();
    const service = allServices.value.find(s => s.name.toLowerCase() === serviceName);

    // Compter les AREAs utilisant ce service
    const areasUsingService = userAreas.value.filter(area =>
      area.action?.service?.name?.toLowerCase() === serviceName ||
      area.reaction?.service?.name?.toLowerCase() === serviceName
    );

    return {
      name: token.serviceName,
      description: service?.description || '',
      actionsCount: service?.actions?.length || 0,
      reactionsCount: service?.reactions?.length || 0,
      areasCount: areasUsingService.length,
      connectedAt: token.createdAt,
    };
  });
});

// Computed - Services internes (timer, console, etc.)
const internalServices = computed(() => {
  return allServices.value
    .filter(service =>
      ((service.type || '').toLowerCase() === 'internal') ||
      ((service.type || '').toLowerCase() === 'webhook') ||
      ((service.type || '').toLowerCase() === 'api') ||
      ((service.type || '').toLowerCase() === 'apikey')
    )
    .map(service => ({
      name: service.name,
      description: service.description || `Service ${service.name}`,
      type: service.type,
      actionsCount: service.actions?.length || 0,
      reactionsCount: service.reactions?.length || 0,
    }));
});

const botServices = computed(() => {
  return allServices.value
    .filter(service => (service.type || '').toLowerCase() === 'bot')
    .map(service => ({
      name: service.name,
      description: service.description || `Service ${service.name}`,
      type: service.type,
      actionsCount: service.actions?.length || 0,
      reactionsCount: service.reactions?.length || 0,
    }));
});

// Computed - Statistiques
const connectedServicesCount = computed(() => connectedOAuthTokens.value.length);

const totalAreasUsingServices = computed(() => {
  const uniqueAreas = new Set();

  connectedOAuthTokens.value.forEach(token => {
    const serviceName = token.serviceName.toLowerCase();
    userAreas.value.forEach(area => {
      if (
        area.action?.service?.name?.toLowerCase() === serviceName ||
        area.reaction?.service?.name?.toLowerCase() === serviceName
      ) {
        uniqueAreas.add(area.id);
      }
    });
  });

  return uniqueAreas.size;
});

// Méthodes
const getServiceIcon = (serviceName) => {
  return serviceIcons[serviceName?.toLowerCase()] || "mdi:puzzle";
};

const buildAuthHeaders = () => {
  return authCookie.value
    ? {
        Authorization: `Bearer ${authCookie.value}`,
      }
    : {};
};

const resetTelegramStatus = () => {
  telegramStatus.value = {
    configured: false,
    displayName: null,
    updatedAt: null,
    botId: null,
  };
  telegramForceOverwrite.value = false;
  telegramStatusLoading.value = false;
};

const refreshOAuthTokens = async () => {
  if (!authCookie.value) {
    connectedOAuthTokens.value = [];
    return;
  }

  try {
    const tokensResponse = await $fetch("/auth/oauth/tokens", {
      baseURL: config.public.apiBaseUrl,
      headers: buildAuthHeaders(),
    });

    if (tokensResponse.success || Array.isArray(tokensResponse.data)) {
      connectedOAuthTokens.value = tokensResponse.data || [];
    } else {
      connectedOAuthTokens.value = [];
    }
  } catch (error) {
    console.error("[Services] Error loading OAuth tokens:", error);
    connectedOAuthTokens.value = [];
  }
};

const loadTelegramStatus = async () => {
  if (!authCookie.value) {
    resetTelegramStatus();
    return;
  }

  telegramStatusLoading.value = true;

  try {
    const statusResponse = await $fetch("/api/telegram/status", {
      baseURL: config.public.apiBaseUrl,
      headers: buildAuthHeaders(),
    });

    if (statusResponse.success && statusResponse.data) {
      telegramStatus.value = {
        configured: Boolean(statusResponse.data.configured),
        displayName: statusResponse.data.displayName || null,
        updatedAt: statusResponse.data.updatedAt || null,
        botId: statusResponse.data.botId || null,
      };
    } else {
      resetTelegramStatus();
    }
  } catch (error) {
    console.error("[Services] Error loading Telegram status:", error);
  } finally {
    telegramStatusLoading.value = false;
  }
};

const handleTelegramConfigure = async () => {
  if (!authCookie.value) {
    telegramError.value = "Vous devez être connecté pour configurer Telegram.";
    return;
  }

  const token = telegramTokenInput.value.trim();

  if (!token) {
    telegramError.value = "Veuillez renseigner le token fourni par BotFather.";
    return;
  }

  telegramSaving.value = true;
  telegramError.value = null;
  telegramSuccess.value = null;

  try {
    const configureResponse = await $fetch("/api/telegram/configure", {
      method: "POST",
      baseURL: config.public.apiBaseUrl,
      headers: {
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: {
        botToken: token,
        force: telegramForceOverwrite.value,
      },
    });

    telegramSuccess.value = configureResponse.message || "Bot Telegram configuré avec succès.";
    telegramTokenInput.value = "";
    telegramForceOverwrite.value = false;

    await Promise.all([
      loadTelegramStatus(),
      refreshOAuthTokens(),
    ]);
  } catch (error) {
    const apiError = error?.data?.error || error?.data?.message || error?.message;
    telegramError.value = apiError || "Impossible de configurer le bot Telegram.";
  } finally {
    telegramSaving.value = false;
  }
};

const handleTelegramDisconnect = async () => {
  if (!authCookie.value) {
    telegramError.value = "Vous devez être connecté pour déconnecter Telegram.";
    return;
  }

  if (!telegramStatus.value.configured) {
    telegramError.value = "Aucun bot Telegram configuré.";
    return;
  }

  telegramDisconnecting.value = true;
  telegramError.value = null;
  telegramSuccess.value = null;

  try {
    const disconnectResponse = await $fetch("/api/telegram/configure", {
      method: "DELETE",
      baseURL: config.public.apiBaseUrl,
      headers: buildAuthHeaders(),
    });

    telegramSuccess.value = disconnectResponse.message || "Bot Telegram déconnecté.";
    resetTelegramStatus();

    await Promise.all([
      refreshOAuthTokens(),
      loadTelegramStatus(),
    ]);
  } catch (error) {
    const apiError = error?.data?.error || error?.data?.message || error?.message;
    telegramError.value = apiError || "Impossible de déconnecter le bot Telegram.";
  } finally {
    telegramDisconnecting.value = false;
  }
};

const loadData = async () => {
  loading.value = true;

  try {
    // Charger tous les services disponibles
    const aboutResponse = await $fetch("/about.json", {
      baseURL: config.public.apiBaseUrl,
    });

    if (aboutResponse.server?.services) {
      allServices.value = aboutResponse.server.services;
      console.log('[Services] Services chargés:', allServices.value.map(service => ({
        name: service.name,
        type: service.type
      })));
    }

    // Charger les tokens OAuth (services connectés)
    await refreshOAuthTokens();

    // Charger les AREAs de l'utilisateur si authentifié
    if (authCookie.value) {
      try {
        const areasResponse = await $fetch("/api/areas", {
          baseURL: config.public.apiBaseUrl,
          headers: buildAuthHeaders(),
        });

        if (areasResponse.success) {
          userAreas.value = areasResponse.data || [];
        } else {
          userAreas.value = [];
        }
      } catch (areasError) {
        console.error("[Services] Error loading user AREAs:", areasError);
        userAreas.value = [];
      }
    } else {
      userAreas.value = [];
    }

    // Charger l'état du bot Telegram
    await loadTelegramStatus();

  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  } finally {
    loading.value = false;
  }
};

watch(
  () => authCookie.value,
  (newToken, oldToken) => {
    if (newToken && !oldToken) {
      loadData();
      return;
    }

    if (!newToken && oldToken) {
      connectedOAuthTokens.value = [];
      userAreas.value = [];
      resetTelegramStatus();
      telegramSuccess.value = null;
      telegramError.value = null;
    }
  }
);

const handleConnectService = async (service) => {
  connectingService.value = service.name;

  try {
    // Stocker l'URL de retour
    const returnUrl = useCookie('oauth-return-url');
    returnUrl.value = '/services';

    // Récupérer userId depuis le token JWT
    let userId = null;
    if (authCookie.value) {
      try {
        // Décoder le JWT pour obtenir le userId
        const tokenParts = authCookie.value.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = payload.sub || payload.userId;
          console.log('[Services] userId from JWT:', userId);
        }
      } catch (e) {
        console.error('[Services] Error decoding JWT:', e);
      }
    }

    // Construire l'URL OAuth avec userId
    let oauthUrl = `${config.public.apiBaseUrl}/auth/oauth/${service.name.toLowerCase()}?source=services`;
    if (userId) {
      oauthUrl += `&userId=${userId}`;
      console.log('[Services] OAuth URL with userId:', oauthUrl);
    } else {
      console.warn('[Services] No userId found - OAuth will use email lookup fallback');
    }

    console.log(`[Services] Redirecting to OAuth: ${oauthUrl}`);
    window.location.href = oauthUrl;
  } catch (error) {
    console.error(`Erreur lors de la connexion à ${service.name}:`, error);
    connectingService.value = null;
  }
};

const viewServiceAreas = (service) => {
  navigateTo({
    path: "/areas",
    query: { service: service.name },
  });
};

const disconnectService = (service) => {
  serviceToDisconnect.value = service;
  showDisconnectModal.value = true;
};

const confirmDisconnect = async () => {
  if (!serviceToDisconnect.value) return;

  disconnecting.value = true;
  try {
    await $fetch(`/auth/oauth/${serviceToDisconnect.value.name.toLowerCase()}`, {
      method: "DELETE",
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${useCookie("auth-token").value}`,
      },
    });

    // Recharger les données
    await loadData();

    showDisconnectModal.value = false;
    serviceToDisconnect.value = null;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    alert("Erreur lors de la déconnexion du service");
  } finally {
    disconnecting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>
