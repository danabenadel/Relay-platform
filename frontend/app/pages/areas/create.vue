<!-- pages/areas/create.vue -->
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
              aria-label="AREAs (page actuelle)"
              aria-current="page"
              class="text-white px-4 py-2 rounded-lg bg-white/20 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
    <header role="banner" class="bg-white/5 backdrop-blur-sm border-b border-white/10 py-6">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Créer une nouvelle AREA</h1>
            <p class="text-blue-200">
              Connectez un déclencheur (Action) à une réaction automatique
            </p>
          </div>
          <NuxtLink
            to="/areas"
            aria-label="Annuler et retourner aux automatisations"
            class="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon name="mdi:close" aria-hidden="true" class="w-5 h-5 inline mr-2" />
            Annuler
          </NuxtLink>
        </div>

        <!-- Indicateur de progression -->
        <div role="progressbar" :aria-valuenow="step + 1" aria-valuemin="1" :aria-valuemax="steps.length" :aria-label="`Étape ${step + 1} sur ${steps.length} : ${steps[step].label}`" class="mt-6 flex items-center justify-between max-w-2xl">
          <div
            v-for="(stepItem, index) in steps"
            :key="index"
            class="flex items-center flex-1"
          >
            <div class="flex flex-col items-center flex-1">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                  step > index
                    ? 'bg-green-500 text-white'
                    : step === index
                    ? 'bg-blue-600 text-white ring-4 ring-blue-400/30'
                    : 'bg-white/10 text-white/50',
                ]"
                :aria-label="step > index ? `${stepItem.label} terminé` : step === index ? `${stepItem.label} en cours` : `${stepItem.label} à venir`"
              >
                <Icon v-if="step > index" name="mdi:check" aria-hidden="true" class="w-5 h-5" />
                <span v-else aria-hidden="true">{{ index + 1 }}</span>
              </div>
              <span
                :class="[
                  'text-xs mt-2 font-medium',
                  step >= index ? 'text-white' : 'text-white/50',
                ]"
              >
                {{ stepItem.label }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'h-1 flex-1 transition-all mx-2',
                step > index ? 'bg-green-500' : 'bg-white/10',
              ]"
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main id="main-content" role="main" class="max-w-5xl mx-auto px-4 py-8">
      <!-- Étape 1: Choix de l'Action -->
      <section v-if="step === 0" role="region" aria-labelledby="step-1-title" class="space-y-6">
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 id="step-1-title" class="text-2xl font-bold text-white mb-2">
            Choisissez un déclencheur (Action)
          </h2>
          <p class="text-white/70 mb-6">
            Sélectionnez le service et l'événement qui déclenchera votre automatisation
          </p>

          <!-- Sélection du service -->
          <div class="mb-6">
            <label id="action-service-label" class="block text-sm font-medium text-white mb-3">Service</label>
            <div role="radiogroup" aria-labelledby="action-service-label" class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="service in availableServices"
                :key="service.name"
                @click="selectActionService(service)"
                role="radio"
                :aria-checked="selectedActionService?.name === service.name"
                :aria-label="`Sélectionner le service ${service.name}`"
                :class="[
                  'p-4 rounded-xl border-2 transition-all text-center',
                  selectedActionService?.name === service.name
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10',
                ]"
                class="focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon :name="getServiceIcon(service.name)" aria-hidden="true" class="w-12 h-12 mx-auto mb-2 text-white" />
                <div class="text-sm font-medium text-white">{{ service.name }}</div>
              </button>
            </div>
          </div>

          <!-- Sélection de l'action -->
          <div v-if="selectedActionService" class="space-y-3">
            <label id="action-event-label" class="block text-sm font-medium text-white mb-3">
              Événement déclencheur
            </label>
            <div role="radiogroup" aria-labelledby="action-event-label" class="space-y-3">
              <button
                v-for="action in selectedActionService.actions"
                :key="action.name"
                @click="selectAction(action)"
                role="radio"
                :aria-checked="selectedAction?.name === action.name"
                :aria-label="`Sélectionner l'événement ${action.description}`"
                :class="[
                  'w-full p-4 rounded-xl border-2 transition-all text-left',
                  selectedAction?.name === action.name
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10',
                ]"
                class="focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-white mb-1">{{ action.description }}</div>
                    <div class="text-xs text-white/60">{{ action.name }}</div>
                  </div>
                  <Icon
                    v-if="selectedAction?.name === action.name"
                    name="mdi:check-circle"
                    aria-hidden="true"
                    class="w-6 h-6 text-blue-400"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Bouton suivant -->
        <div class="flex justify-end">
          <button
            @click="nextStep"
            :disabled="!selectedAction"
            aria-label="Passer à l'étape suivante"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Suivant
            <Icon name="mdi:arrow-right" aria-hidden="true" class="w-5 h-5 inline ml-2" />
          </button>
        </div>
      </section>

      <!-- Étape 2: Choix de la Réaction -->
      <section v-if="step === 1" role="region" aria-labelledby="step-2-title" class="space-y-6">
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 id="step-2-title" class="text-2xl font-bold text-white mb-2">
            Choisissez une réaction
          </h2>
          <p class="text-white/70 mb-6">
            Sélectionnez le service et l'action qui sera exécutée automatiquement
          </p>

          <!-- Résumé de l'action -->
          <div class="mb-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
            <div class="text-sm text-blue-300 mb-1">Quand</div>
            <div class="text-white font-medium">
              {{ selectedActionService?.name }} - {{ selectedAction?.description }}
            </div>
          </div>

          <!-- Sélection du service -->
          <div class="mb-6">
            <label id="reaction-service-label" class="block text-sm font-medium text-white mb-3">Service</label>
            <div role="radiogroup" aria-labelledby="reaction-service-label" class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="service in availableServices"
                :key="service.name"
                @click="selectReactionService(service)"
                role="radio"
                :aria-checked="selectedReactionService?.name === service.name"
                :aria-label="`Sélectionner le service ${service.name} pour la réaction`"
                :class="[
                  'p-4 rounded-xl border-2 transition-all text-center',
                  selectedReactionService?.name === service.name
                    ? 'border-green-500 bg-green-600/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10',
                ]"
                class="focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Icon :name="getServiceIcon(service.name)" aria-hidden="true" class="w-12 h-12 mx-auto mb-2 text-white" />
                <div class="text-sm font-medium text-white">{{ service.name }}</div>
              </button>
            </div>
          </div>

          <!-- Sélection de la réaction -->
          <div v-if="selectedReactionService" class="space-y-3">
            <label id="reaction-action-label" class="block text-sm font-medium text-white mb-3">
              Action à exécuter
            </label>
            <div role="radiogroup" aria-labelledby="reaction-action-label" class="space-y-3">
              <button
                v-for="reaction in selectedReactionService.reactions"
                :key="reaction.name"
                @click="selectReaction(reaction)"
                role="radio"
                :aria-checked="selectedReaction?.name === reaction.name"
                :aria-label="`Sélectionner la réaction ${reaction.description}`"
                :class="[
                  'w-full p-4 rounded-xl border-2 transition-all text-left',
                  selectedReaction?.name === reaction.name
                    ? 'border-green-500 bg-green-600/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10',
                ]"
                class="focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-white mb-1">{{ reaction.description }}</div>
                    <div class="text-xs text-white/60">{{ reaction.name }}</div>
                  </div>
                  <Icon
                    v-if="selectedReaction?.name === reaction.name"
                    name="mdi:check-circle"
                    aria-hidden="true"
                    class="w-6 h-6 text-green-400"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Boutons navigation -->
        <div class="flex justify-between">
          <button
            @click="previousStep"
            aria-label="Retour à l'étape précédente"
            class="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon name="mdi:arrow-left" aria-hidden="true" class="w-5 h-5 inline mr-2" />
            Précédent
          </button>
          <button
            @click="nextStep"
            :disabled="!selectedReaction"
            aria-label="Passer à l'étape de configuration"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Suivant
            <Icon name="mdi:arrow-right" aria-hidden="true" class="w-5 h-5 inline ml-2" />
          </button>
        </div>
      </section>

      <!-- Étape 3: Configuration -->
      <section v-if="step === 2" role="region" aria-labelledby="step-3-title" class="space-y-6">
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 id="step-3-title" class="text-2xl font-bold text-white mb-2">Configuration</h2>
          <p class="text-white/70 mb-6">
            Configurez votre automatisation
          </p>

          <!-- Résumé du flux -->
          <div role="region" aria-label="Récapitulatif du flux d'automatisation" class="mb-6 p-4 bg-gradient-to-r from-blue-600/10 to-green-600/10 border border-white/20 rounded-xl">
            <div class="flex items-center justify-center gap-4">
              <div class="text-center">
                <Icon :name="getServiceIcon(selectedActionService?.name)" aria-hidden="true" class="w-16 h-16 mx-auto mb-2 text-white" />
                <div class="text-sm text-white font-medium">{{ selectedActionService?.name }}</div>
                <div class="text-xs text-white/60 mt-1">{{ selectedAction?.description }}</div>
              </div>
              <Icon name="mdi:arrow-right" aria-hidden="true" class="w-8 h-8 text-white/50" />
              <div class="text-center">
                <Icon :name="getServiceIcon(selectedReactionService?.name)" aria-hidden="true" class="w-16 h-16 mx-auto mb-2 text-white" />
                <div class="text-sm text-white font-medium">{{ selectedReactionService?.name }}</div>
                <div class="text-xs text-white/60 mt-1">{{ selectedReaction?.description }}</div>
              </div>
            </div>
          </div>

          <!-- Formulaire -->
          <div class="space-y-4">
            <!-- Configuration Timer si action = timer -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'timer'" class="space-y-4">
              <div class="p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">⏰ Configuration du Timer</h3>

                <div v-if="selectedAction?.name === 'timer_time'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Heure de déclenchement (HH:MM) <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="timerConfig.targetTime"
                      type="time"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Intervalle de vérification (secondes)
                    </label>
                    <input
                      v-model.number="timerConfig.checkInterval"
                      type="number"
                      min="30"
                      placeholder="60"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="text-xs text-white/50 mt-1">Minimum 30 secondes recommandé</p>
                  </div>
                </div>

                <div v-if="selectedAction?.name === 'timer_date'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Date de déclenchement (JJ/MM) <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="timerConfig.targetDate"
                      type="text"
                      placeholder="25/12"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="text-xs text-white/50 mt-1">Format: JJ/MM (ex: 25/12 pour le 25 décembre)</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Intervalle de vérification (secondes)
                    </label>
                    <input
                      v-model.number="timerConfig.checkInterval"
                      type="number"
                      min="60"
                      placeholder="3600"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="text-xs text-white/50 mt-1">3600s = 1 heure recommandé pour les dates</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration Discord Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'discord'" class="space-y-4">
              <div class="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">🎮 Configuration Reaction Discord</h3>

                <!-- Webhook-based reaction (discord_webhook) -->
                <div v-if="selectedReaction?.name === 'discord_webhook'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      URL du Webhook Discord <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="discordConfig.webhookUrl"
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="text-xs text-white/50 mt-1">
                      Obtenu dans Paramètres du serveur → Intégrations → Webhooks
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Titre du message
                    </label>
                    <input
                      v-model="discordConfig.title"
                      type="text"
                      placeholder="Notification AREA"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Couleur du message (décimal)
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model.number="discordConfig.color"
                        type="number"
                        placeholder="3066993"
                        class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div
                        :style="{ backgroundColor: `#${discordConfig.color?.toString(16).padStart(6, '0')}` }"
                        class="w-12 h-12 rounded-xl border border-white/20"
                      ></div>
                    </div>
                    <p class="text-xs text-white/50 mt-1">
                      Ex: 3066993 (vert), 15158332 (rouge), 3447003 (bleu)
                    </p>
                  </div>
                </div>

                <!-- API-based reactions (send_message, send_dm, send_embed, etc.) -->
                <div v-else>
                  <DiscordReactionConfig
                    :reaction-type="selectedReaction?.name"
                    :config="discordReactionConfig"
                    @update:config="discordReactionConfig = $event"
                  />
                </div>
              </div>
            </div>

            <!-- Configuration Spotify Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'spotify'" class="space-y-4">
              <div class="p-4 bg-green-600/10 border border-green-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">🎵 Configuration Action Spotify</h3>
                <SpotifyActionConfig
                  :action-type="selectedAction?.name"
                  :config="spotifyActionConfig"
                  @update:config="spotifyActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Discord Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'discord'" class="space-y-4">
              <div class="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">💬 Configuration Action Discord</h3>
                <DiscordActionConfig
                  :action-type="selectedAction?.name"
                  :config="discordActionConfig"
                  @update:config="discordActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Spotify Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'spotify'" class="space-y-4">
              <div class="p-4 bg-green-600/10 border border-green-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">🎵 Configuration Reaction Spotify</h3>
                <SpotifyReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="spotifyReactionConfig"
                  @update:config="spotifyReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Google Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'google'" class="space-y-4">
              <div class="p-4 bg-red-600/10 border border-red-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">📧 Configuration Action Google</h3>
                <GoogleActionConfig
                  :action-type="selectedAction?.name"
                  :config="googleActionConfig"
                  @update:config="googleActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Reddit Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'reddit'" class="space-y-4">
              <div class="p-4 bg-orange-600/10 border border-orange-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">📱 Configuration Action Reddit</h3>
                <RedditActionConfig
                  :action-type="selectedAction?.name"
                  :config="redditActionConfig"
                  @update:config="redditActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Google Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'google'" class="space-y-4">
              <div class="p-4 bg-red-600/10 border border-red-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">📧 Configuration Reaction Google</h3>
                <GoogleReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="googleReactionConfig"
                  @update:config="googleReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Telegram Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'telegram'" class="space-y-4">
              <div class="p-4 bg-sky-600/10 border border-sky-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">📨 Configuration Action Telegram</h3>
                <TelegramActionConfig
                  :action-type="selectedAction?.name"
                  :config="telegramActionConfig"
                  @update:config="telegramActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Telegram Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'telegram'" class="space-y-4">
              <div class="p-4 bg-sky-600/10 border border-sky-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">📨 Configuration Reaction Telegram</h3>
                <TelegramReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="telegramReactionConfig"
                  @update:config="telegramReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Reddit Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'reddit'" class="space-y-4">
              <div class="p-4 bg-orange-600/10 border border-orange-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3"> Configuration Reaction Reddit</h3>
                <RedditReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="redditReactionConfig"
                  @update:config="redditReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Discord Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'discord'" class="space-y-4">
              <div class="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">💬 Configuration Reaction Discord</h3>
                <DiscordReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="discordReactionConfig"
                  @update:config="discordReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration GitHub Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'github'" class="space-y-4">
              <div class="p-4 bg-gray-600/10 border border-gray-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Action GitHub</h3>
                <GitHubActionConfig
                  :action-type="selectedAction?.name"
                  :config="githubActionConfig"
                  @update:config="githubActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration GitHub Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'github'" class="space-y-4">
              <div class="p-4 bg-gray-600/10 border border-gray-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Reaction GitHub</h3>
                <GitHubReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="githubReactionConfig"
                  @update:config="githubReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration GitLab Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'gitlab'" class="space-y-4">
              <div class="p-4 bg-orange-600/10 border border-orange-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Action GitLab</h3>
                <GitLabActionConfig
                  :action-type="selectedAction?.name"
                  :config="gitlabActionConfig"
                  @update:config="gitlabActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration GitLab Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'gitlab'" class="space-y-4">
              <div class="p-4 bg-orange-600/10 border border-orange-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Reaction GitLab</h3>
                <GitLabReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="gitlabReactionConfig"
                  @update:config="gitlabReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration OpenAI Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'openai'" class="space-y-4">
              <div class="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Reaction OpenAI</h3>
                <OpenAIReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="openaiReactionConfig"
                  @update:config="openaiReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration YouTube Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'youtube'" class="space-y-4">
              <div class="p-4 bg-red-600/10 border border-red-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Action YouTube</h3>
                <YouTubeActionConfig
                  :action-type="selectedAction?.name"
                  :config="youtubeActionConfig"
                  @update:config="youtubeActionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration YouTube Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'youtube'" class="space-y-4">
              <div class="p-4 bg-red-600/10 border border-red-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">Configuration Reaction YouTube</h3>
                <YouTubeReactionConfig
                  :reaction-type="selectedReaction?.name"
                  :config="youtubeReactionConfig"
                  @update:config="youtubeReactionConfig = $event"
                />
              </div>
            </div>

            <!-- Configuration Notion Action -->
            <div v-if="selectedActionService?.name?.toLowerCase() === 'notion'" class="space-y-4">
              <div class="p-4 bg-slate-600/10 border border-slate-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">🗂️ Configuration Action Notion</h3>

                <div v-if="selectedAction?.name === 'notion_new_page_created'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Filtrer par titre (facultatif)
                    </label>
                    <input
                      v-model="notionActionConfig.search_query"
                      type="text"
                      placeholder='Ex : Roadmap ou "Client"'
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <p class="text-xs text-white/50 mt-1">
                      Seules les pages dont le titre contient ce texte déclencheront l'action
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Intervalle de vérification (secondes)
                    </label>
                    <input
                      v-model.number="notionActionConfig.checkInterval"
                      type="number"
                      min="15"
                      placeholder="60"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <p class="text-xs text-white/50 mt-1">
                      Minimum 15 secondes · 60 recommandé
                    </p>
                  </div>
                </div>

                <div v-if="selectedAction?.name === 'notion_database_entry_added'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      ID de la base de données <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="notionActionConfig.database_id"
                      type="text"
                      placeholder="Ex : 1234567890abcdef1234567890abcdef"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <p class="text-xs text-white/50 mt-1">
                      Copiez l'identifiant de la base (32 caractères) depuis l'URL Notion
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Intervalle de vérification (secondes)
                    </label>
                    <input
                      v-model.number="notionActionConfig.checkInterval"
                      type="number"
                      min="15"
                      placeholder="60"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div v-if="selectedAction?.name === 'notion_page_updated'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      ID de la page surveillée <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="notionActionConfig.page_id"
                      type="text"
                      placeholder="Ex : 1234567890abcdef1234567890abcdef"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <p class="text-xs text-white/50 mt-1">
                      L'identifiant se trouve dans l'URL de la page
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Intervalle de vérification (secondes)
                    </label>
                    <input
                      v-model.number="notionActionConfig.checkInterval"
                      type="number"
                      min="15"
                      placeholder="60"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration Notion Reaction -->
            <div v-if="selectedReactionService?.name?.toLowerCase() === 'notion'" class="space-y-4">
              <div class="p-4 bg-slate-600/10 border border-slate-500/30 rounded-xl">
                <h3 class="text-white font-medium mb-3">📝 Configuration Reaction Notion</h3>

                <div v-if="selectedReaction?.name === 'notion_create_page'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      ID du parent (page ou base) <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="notionReactionConfig.parent_id"
                      type="text"
                      placeholder="Ex : 1234567890abcdef1234567890abcdef"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Type de parent
                    </label>
                    <select
                      v-model="notionReactionConfig.parent_type"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      <option value="database" class="bg-slate-800 text-white">Base de données</option>
                      <option value="page" class="bg-slate-800 text-white">Page</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Propriétés (JSON) <span class="text-red-400">*</span>
                    </label>
                    <textarea
                      v-model="notionReactionConfig.properties"
                      rows="4"
                      placeholder='{"Title":{"title":[{"text":{"content":"Titre"}}]}}'
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    ></textarea>
                    <p class="text-xs text-white/50 mt-1">
                      Utilisez le format attendu par l'API Notion. Incluez au minimum la propriété de titre.
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Contenu (blocks) JSON (facultatif)
                    </label>
                    <textarea
                      v-model="notionReactionConfig.children"
                      rows="3"
                      placeholder='[{"object":"block","paragraph":{"text":[{"type":"text","text":{"content":"Bonjour"}}]}}]'
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    ></textarea>
                  </div>
                </div>

                <div v-if="selectedReaction?.name === 'notion_database_add_entry'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      ID de la base de données <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="notionReactionConfig.database_id"
                      type="text"
                      placeholder="Ex : 1234567890abcdef1234567890abcdef"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Propriétés (JSON) <span class="text-red-400">*</span>
                    </label>
                    <textarea
                      v-model="notionReactionConfig.properties"
                      rows="4"
                      placeholder='{"Nom":{"title":[{"text":{"content":"Nouvelle entrée"}}]}}'
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Contenu (blocks) JSON (facultatif)
                    </label>
                    <textarea
                      v-model="notionReactionConfig.children"
                      rows="3"
                      placeholder='[{"object":"block","paragraph":{"text":[{"type":"text","text":{"content":"Description..."}}]}}]'
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    ></textarea>
                  </div>
                </div>

                <div v-if="selectedReaction?.name === 'notion_update_page'" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      ID de la page à modifier <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="notionReactionConfig.page_id"
                      type="text"
                      placeholder="Ex : 1234567890abcdef1234567890abcdef"
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white mb-2">
                      Propriétés à mettre à jour (JSON) <span class="text-red-400">*</span>
                    </label>
                    <textarea
                      v-model="notionReactionConfig.properties"
                      rows="4"
                      placeholder='{"Status":{"select":{"name":"Terminé"}}}'
                      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    ></textarea>
                    <p class="text-xs text-white/50 mt-1">
                      Seules les propriétés présentes seront mises à jour
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Boutons navigation -->
        <div class="flex justify-between">
          <button
            type="button"
            @click="previousStep"
            aria-label="Retour à l'étape précédente"
            class="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon name="mdi:arrow-left" aria-hidden="true" class="w-5 h-5 inline mr-2" />
            Précédent
          </button>
          <button
            type="button"
            @click="createArea"
            :disabled="!isConfigValid || creating"
            :aria-busy="creating"
            aria-label="Créer l'automatisation maintenant"
            class="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Icon
              :name="creating ? 'mdi:loading' : 'mdi:check'"
              aria-hidden="true"
              :class="['w-5 h-5 inline mr-2', creating ? 'animate-spin' : '']"
            />
            {{ creating ? 'Création...' : 'Créer l\'AREA' }}
          </button>
        </div>

        <!-- Message d'erreur validation -->
        <div v-if="!isConfigValid && (timerConfig.targetTime || timerConfig.targetDate || discordConfig.webhookUrl)" role="alert" aria-live="assertive" class="mt-4 p-4 bg-red-600/10 border border-red-500/30 rounded-xl">
          <div class="flex items-start gap-2">
            <Icon name="mdi:alert-circle" aria-hidden="true" class="w-5 h-5 text-red-400 mt-0.5" />
            <div class="text-sm text-red-300">
              {{ validationMessage }}
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import SpotifyActionConfig from '~/components/AREA/SpotifyActionConfig.vue';
import SpotifyReactionConfig from '~/components/AREA/SpotifyReactionConfig.vue';
import GoogleActionConfig from '~/components/AREA/GoogleActionConfig.vue';
import GoogleReactionConfig from '~/components/AREA/GoogleReactionConfig.vue';
import RedditActionConfig from '~/components/AREA/RedditActionConfig.vue';
import RedditReactionConfig from '~/components/AREA/RedditReactionConfig.vue';
import DiscordActionConfig from '~/components/AREA/DiscordActionConfig.vue';
import DiscordReactionConfig from '~/components/AREA/DiscordReactionConfig.vue';
import GitHubActionConfig from '~/components/AREA/GitHubActionConfig.vue';
import GitHubReactionConfig from '~/components/AREA/GitHubReactionConfig.vue';
import GitLabActionConfig from '~/components/AREA/GitLabActionConfig.vue';
import GitLabReactionConfig from '~/components/AREA/GitLabReactionConfig.vue';
import OpenAIReactionConfig from '~/components/AREA/OpenAIReactionConfig.vue';
import YouTubeActionConfig from '~/components/AREA/YouTubeActionConfig.vue';
import YouTubeReactionConfig from '~/components/AREA/YouTubeReactionConfig.vue';
import TelegramActionConfig from '~/components/AREA/TelegramActionConfig.vue';
import TelegramReactionConfig from '~/components/AREA/TelegramReactionConfig.vue';

definePageMeta({
  middleware: 'auth'
});

// Configuration
useHead({
  title: "Créer une AREA - Relay",
  meta: [{ name: "description", content: "Créez une nouvelle automatisation" }],
});

const config = useRuntimeConfig();
const authCookie = useCookie("auth-token");
const toast = useToast();

// État du wizard
const step = ref(0);
const steps = [
  { label: "Action" },
  { label: "Réaction" },
  { label: "Configuration" },
];

// État des sélections
const availableServices = ref([]);
const connectedOAuthTokens = ref([]);
const selectedActionService = ref(null);
const selectedAction = ref(null);
const selectedReactionService = ref(null);
const selectedReaction = ref(null);

// Configuration de l'AREA
const areaName = ref("");
const areaDescription = ref("");
const areaActive = ref(true);
const creating = ref(false);

// Configuration Timer
const timerConfig = ref({
  targetTime: "",
  targetDate: "",
  checkInterval: 60,
});

// Configuration Discord
const discordConfig = ref({
  webhookUrl: "",
  title: "Notification AREA",
  color: 3066993,
});

// Configuration Spotify
const spotifyActionConfig = ref({});
const spotifyReactionConfig = ref({});

// Configuration Google
const googleActionConfig = ref({});
const googleReactionConfig = ref({});

// Configuration Reddit
const redditActionConfig = ref({});
const redditReactionConfig = ref({});

// Configuration Discord
const discordActionConfig = ref({});
const discordReactionConfig = ref({});
// Configuration GitHub
const githubActionConfig = ref({});
const githubReactionConfig = ref({});

// Configuration GitLab
const gitlabActionConfig = ref({});
const gitlabReactionConfig = ref({});

// Configuration OpenAI
const openaiReactionConfig = ref({});

// Configuration YouTube
const youtubeActionConfig = ref({});
const youtubeReactionConfig = ref({});

// Configuration Telegram
const telegramActionConfig = ref({});
const telegramReactionConfig = ref({});
// Configuration Notion
const defaultNotionActionConfig = () => ({
  search_query: "",
  database_id: "",
  page_id: "",
  checkInterval: 60,
});

const defaultNotionReactionConfig = () => ({
  parent_id: "",
  parent_type: "database",
  database_id: "",
  page_id: "",
  properties: "",
  children: "",
});

const notionActionConfig = ref(defaultNotionActionConfig());
const notionReactionConfig = ref(defaultNotionReactionConfig());

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
  openai: "mdi:robot",
  youtube: "mdi:youtube",
  telegram: "mdi:telegram",
  notion: "simple-icons:notion",
};

const isValidJson = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }
  try {
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
};

const sanitizeConfig = (configObj) => {
  if (!configObj || typeof configObj !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(configObj).filter(([_, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value === "string" && value.trim() === "") {
        return false;
      }
      return true;
    })
  );
};

watch(
  () => selectedActionService.value?.name,
  (serviceName) => {
    if ((serviceName || "").toLowerCase() === "notion") {
      const preservedInterval = notionActionConfig.value.checkInterval || 60;
      notionActionConfig.value = {
        ...defaultNotionActionConfig(),
        checkInterval: preservedInterval,
      };
    } else {
      notionActionConfig.value = defaultNotionActionConfig();
    }
  }
);

watch(
  () => selectedAction.value?.name,
  (actionName) => {
    if ((selectedActionService.value?.name || "").toLowerCase() !== "notion") {
      return;
    }

    const interval = notionActionConfig.value.checkInterval || 60;

    if (actionName === "notion_new_page_created") {
      notionActionConfig.value = {
        search_query: "",
        checkInterval: interval,
      };
    } else if (actionName === "notion_database_entry_added") {
      notionActionConfig.value = {
        database_id: "",
        checkInterval: interval,
      };
    } else if (actionName === "notion_page_updated") {
      notionActionConfig.value = {
        page_id: "",
        checkInterval: interval,
      };
    }
  }
);

watch(
  () => selectedReactionService.value?.name,
  (serviceName) => {
    if ((serviceName || "").toLowerCase() === "notion") {
      notionReactionConfig.value = defaultNotionReactionConfig();
    } else {
      notionReactionConfig.value = defaultNotionReactionConfig();
    }
  }
);

watch(
  () => selectedReaction.value?.name,
  (reactionName) => {
    if ((selectedReactionService.value?.name || "").toLowerCase() !== "notion") {
      return;
    }

    if (reactionName === "notion_create_page") {
      notionReactionConfig.value = {
        parent_id: "",
        parent_type: "database",
        properties: "",
        children: "",
      };
    } else if (reactionName === "notion_database_add_entry") {
      notionReactionConfig.value = {
        database_id: "",
        properties: "",
        children: "",
      };
    } else if (reactionName === "notion_update_page") {
      notionReactionConfig.value = {
        page_id: "",
        properties: "",
      };
    }
  }
);

// Computed
const isConfigValid = computed(() => {
  // Validation pour Timer
  if (selectedActionService.value?.name?.toLowerCase() === 'timer') {
    if (selectedAction.value?.name === 'timer_time') {
      if (!timerConfig.value.targetTime) return false;
    }
    if (selectedAction.value?.name === 'timer_date') {
      if (!timerConfig.value.targetDate) return false;
      // Valider format JJ/MM
      const dateRegex = /^(\d{1,2})\/(\d{1,2})$/;
      if (!dateRegex.test(timerConfig.value.targetDate)) return false;
    }
  }

  // Validation pour Discord Webhook
  if (selectedReactionService.value?.name?.toLowerCase() === 'discord' && selectedReaction.value?.name === 'discord_webhook') {
    if (!discordConfig.value.webhookUrl) return false;
    // Valider que c'est une URL Discord webhook (discord.com ou discordapp.com)
    const webhookRegex = /^https?:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
    if (!webhookRegex.test(discordConfig.value.webhookUrl)) return false;
  }

  // Validation pour Spotify Action
  if (selectedActionService.value?.name?.toLowerCase() === 'spotify') {
    const actionType = selectedAction.value?.name;
    // new_track_in_playlist et playlist_updated nécessitent playlistId
    if ((actionType === 'new_track_in_playlist' || actionType === 'playlist_updated') && !spotifyActionConfig.value?.playlistId) {
      return false;
    }
  }

  // Validation pour Spotify Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'spotify') {
    const reactionType = selectedReaction.value?.name;
    // play_track nécessite trackId
    if (reactionType === 'play_track' && !spotifyReactionConfig.value?.trackId) {
      return false;
    }
    // add_to_playlist nécessite playlistId
    if (reactionType === 'add_to_playlist' && !spotifyReactionConfig.value?.playlistId) {
      return false;
    }
    // create_playlist nécessite playlistName
    if (reactionType === 'create_playlist' && !spotifyReactionConfig.value?.playlistName) {
      return false;
    }
    // set_volume nécessite volume
    if (reactionType === 'set_volume' && (spotifyReactionConfig.value?.volume === undefined || spotifyReactionConfig.value?.volume < 0 || spotifyReactionConfig.value?.volume > 100)) {
      return false;
    }
  }

  // Validation pour Google Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'google') {
    const reactionType = selectedReaction.value?.name;
    // google_send_email nécessite to, subject, body
    if (reactionType === 'google_send_email') {
      if (!googleReactionConfig.value?.to || !googleReactionConfig.value?.subject || !googleReactionConfig.value?.body) {
        return false;
      }
    }
    // google_reply_to_email nécessite body
    if (reactionType === 'google_reply_to_email' && !googleReactionConfig.value?.body) {
      return false;
    }
  }

  // Validation pour Telegram Action
  if (selectedActionService.value?.name?.toLowerCase() === 'telegram') {
    const actionType = selectedAction.value?.name;
    const config = telegramActionConfig.value || {};

    if (actionType === 'new_message' && !config?.chat_id?.trim()) {
      return false;
    }
    if (actionType === 'new_member' && !config?.chat_id?.trim()) {
      return false;
    }
    if (actionType === 'channel_post' && !config?.channel_id?.trim()) {
      return false;
    }
  }

  // Validation pour Reddit Action
  if (selectedActionService.value?.name?.toLowerCase() === 'reddit') {
    const actionType = selectedAction.value?.name;
    // new_post_in_subreddit nécessite watchSubreddit
    if (actionType === 'new_post_in_subreddit' && !redditActionConfig.value?.watchSubreddit) {
      return false;
    }
    // new_comment_on_post nécessite postId
    if (actionType === 'new_comment_on_post' && !redditActionConfig.value?.postId) {
      return false;
    }
    // post_score_threshold nécessite postId et threshold
    if (actionType === 'post_score_threshold' && (!redditActionConfig.value?.postId || !redditActionConfig.value?.threshold)) {
      return false;
    }
    // new_subscriber_milestone nécessite subreddit et milestone
    if (actionType === 'new_subscriber_milestone' && (!redditActionConfig.value?.subreddit || !redditActionConfig.value?.milestone)) {
      return false;
    }
  }

  // Validation pour Telegram Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'telegram') {
    const reactionType = selectedReaction.value?.name;
    const config = telegramReactionConfig.value || {};

    if (reactionType === 'send_message') {
      if (!config?.chat_id?.trim() || !config?.message?.trim()) {
        return false;
      }
    }
    if (reactionType === 'send_photo') {
      if (!config?.chat_id?.trim() || !config?.photo_url?.trim()) {
        return false;
      }
    }
    if (reactionType === 'send_document') {
      if (!config?.chat_id?.trim() || !config?.document_url?.trim()) {
        return false;
      }
    }
    if (reactionType === 'create_poll') {
      if (!config?.chat_id?.trim() || !config?.question?.trim() || !config?.options?.trim()) {
        return false;
      }
    }
    if (reactionType === 'pin_message') {
      if (!config?.chat_id?.trim() || !config?.message_id?.trim()) {
        return false;
      }
    }
    if (reactionType === 'kick_user') {
      if (!config?.chat_id?.trim() || !config?.user_id?.trim()) {
        return false;
      }
      if (config?.until_date !== null && config?.until_date !== undefined && Number.isNaN(config.until_date)) {
        return false;
      }
    }
  }

  // Validation pour Reddit Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'reddit') {
    const reactionType = selectedReaction.value?.name;
    // submit_post nécessite targetSubreddit et title
    if (reactionType === 'submit_post' && (!redditReactionConfig.value?.targetSubreddit || !redditReactionConfig.value?.title)) {
      return false;
    }
    // submit_comment nécessite text
    if (reactionType === 'submit_comment' && !redditReactionConfig.value?.text) {
      return false;
    }
    // subscribe_subreddit et unsubscribe_subreddit nécessitent subreddit
    if ((reactionType === 'subscribe_subreddit' || reactionType === 'unsubscribe_subreddit') && !redditReactionConfig.value?.subreddit) {
      return false;
    }
    // send_message nécessite to, subject, text
    if (reactionType === 'send_message' && (!redditReactionConfig.value?.to || !redditReactionConfig.value?.subject || !redditReactionConfig.value?.text)) {
      return false;
    }
  }

  // Validation pour Discord Action OAuth
  if (selectedActionService.value?.name?.toLowerCase() === 'discord' && selectedActionService.value?.type === 'oauth') {
    const actionType = selectedAction.value?.name;
    // new_message_in_channel nécessite channelId
    if (actionType === 'new_message_in_channel' && !discordActionConfig.value?.channelId) {
      return false;
    }
    // new_member_joined nécessite guildId
    if (actionType === 'new_member_joined' && !discordActionConfig.value?.guildId) {
      return false;
    }
    // message_reaction_added nécessite channelId et messageId
    if (actionType === 'message_reaction_added' && (!discordActionConfig.value?.channelId || !discordActionConfig.value?.messageId)) {
      return false;
    }
  }

  // Validation pour Discord Reaction OAuth
  if (selectedReactionService.value?.name?.toLowerCase() === 'discord' && selectedReactionService.value?.type === 'oauth') {
    const reactionType = selectedReaction.value?.name;
    // send_message nécessite channelId et messageContent
    if (reactionType === 'send_message' && (!discordReactionConfig.value?.channelId || !discordReactionConfig.value?.messageContent)) {
      return false;
    }
    // send_embed nécessite channelId et embedTitle
    if (reactionType === 'send_embed' && (!discordReactionConfig.value?.channelId || !discordReactionConfig.value?.embedTitle)) {
      return false;
    }
    // send_dm nécessite targetUserId et messageContent
    if (reactionType === 'send_dm' && (!discordReactionConfig.value?.targetUserId || !discordReactionConfig.value?.messageContent)) {
      return false;
    }
    // add_reaction nécessite channelId, messageId et emoji
    if (reactionType === 'add_reaction' && (!discordReactionConfig.value?.channelId || !discordReactionConfig.value?.messageId || !discordReactionConfig.value?.emoji)) {
      return false;
    }
    // delete_message nécessite channelId et messageId
    if (reactionType === 'delete_message' && (!discordReactionConfig.value?.channelId || !discordReactionConfig.value?.messageId)) {
      return false;
    }
    // pin_message nécessite channelId et messageId
    if (reactionType === 'pin_message' && (!discordReactionConfig.value?.channelId || !discordReactionConfig.value?.messageId)) {
      return false;
    }
  }

  // Validation pour OpenAI Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'openai') {
    const reactionType = selectedReaction.value?.name;
    // generate_text nécessite prompt
    if (reactionType === 'generate_text' && !openaiReactionConfig.value?.prompt) {
      return false;
    }
    // summarize_text nécessite text
    if (reactionType === 'summarize_text' && !openaiReactionConfig.value?.text) {
      return false;
    }
    // answer_question nécessite question
    if (reactionType === 'answer_question' && !openaiReactionConfig.value?.question) {
      return false;
    }
    // code_review nécessite code
    if (reactionType === 'code_review' && !openaiReactionConfig.value?.code) {
      return false;
    }
    // translate_text nécessite text et targetLanguage
    if (reactionType === 'translate_text' && (!openaiReactionConfig.value?.text || !openaiReactionConfig.value?.targetLanguage)) {
      return false;
    }
    // generate_creative nécessite type et topic
    if (reactionType === 'generate_creative' && (!openaiReactionConfig.value?.type || !openaiReactionConfig.value?.topic)) {
      return false;
    }
    // explain_concept nécessite concept
    if (reactionType === 'explain_concept' && !openaiReactionConfig.value?.concept) {
      return false;
    }
    // generate_ideas nécessite topic
    if (reactionType === 'generate_ideas' && !openaiReactionConfig.value?.topic) {
      return false;
    }
  }

  // Validation pour YouTube Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'youtube') {
    const reactionType = selectedReaction.value?.name;
    // youtube_post_comment nécessite videoId et comment
    if (reactionType === 'youtube_post_comment' && (!youtubeReactionConfig.value?.videoId || !youtubeReactionConfig.value?.comment)) {
      return false;
    }
    // youtube_like_video nécessite videoId
    if (reactionType === 'youtube_like_video' && !youtubeReactionConfig.value?.videoId) {
      return false;
    }
    // youtube_add_to_playlist nécessite playlistId et videoId
    if (reactionType === 'youtube_add_to_playlist' && (!youtubeReactionConfig.value?.playlistId || !youtubeReactionConfig.value?.videoId)) {
      return false;
    }
    // youtube_create_playlist nécessite playlistName
    if (reactionType === 'youtube_create_playlist' && !youtubeReactionConfig.value?.playlistName) {
      return false;
    }
    // youtube_subscribe_channel nécessite channelId
    if (reactionType === 'youtube_subscribe_channel' && !youtubeReactionConfig.value?.channelId) {
      return false;
    }
  }

  // Validation pour Notion Action
  if (selectedActionService.value?.name?.toLowerCase() === 'notion') {
    const actionType = selectedAction.value?.name;
    if (actionType === 'notion_database_entry_added' && !notionActionConfig.value?.database_id) {
      return false;
    }
    if (actionType === 'notion_page_updated' && !notionActionConfig.value?.page_id) {
      return false;
    }
  }

  // Validation pour Notion Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'notion') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'notion_create_page') {
      if (!notionReactionConfig.value?.parent_id) {
        return false;
      }
      if (!notionReactionConfig.value?.properties || !isValidJson(notionReactionConfig.value.properties)) {
        return false;
      }
      if (notionReactionConfig.value?.children && !isValidJson(notionReactionConfig.value.children)) {
        return false;
      }
    }
    if (reactionType === 'notion_database_add_entry') {
      if (!notionReactionConfig.value?.database_id) {
        return false;
      }
      if (!notionReactionConfig.value?.properties || !isValidJson(notionReactionConfig.value.properties)) {
        return false;
      }
      if (notionReactionConfig.value?.children && !isValidJson(notionReactionConfig.value.children)) {
        return false;
      }
    }
    if (reactionType === 'notion_update_page') {
      if (!notionReactionConfig.value?.page_id) {
        return false;
      }
      if (!notionReactionConfig.value?.properties || !isValidJson(notionReactionConfig.value.properties)) {
        return false;
      }
    }
  }

  return true;
});

const validationMessage = computed(() => {
  if (selectedActionService.value?.name?.toLowerCase() === 'timer') {
    if (selectedAction.value?.name === 'timer_time' && !timerConfig.value.targetTime) {
      return "Veuillez spécifier une heure de déclenchement";
    }
    if (selectedAction.value?.name === 'timer_date') {
      if (!timerConfig.value.targetDate) {
        return "Veuillez spécifier une date de déclenchement";
      }
      const dateRegex = /^(\d{1,2})\/(\d{1,2})$/;
      if (!dateRegex.test(timerConfig.value.targetDate)) {
        return "Format de date invalide. Utilisez JJ/MM (ex: 25/12)";
      }
    }
  }

  if (selectedReactionService.value?.name?.toLowerCase() === 'discord') {
    if (!discordConfig.value.webhookUrl) {
      return "Veuillez spécifier l'URL du webhook Discord";
    }
    const webhookRegex = /^https?:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
    if (!webhookRegex.test(discordConfig.value.webhookUrl)) {
      return "URL du webhook Discord invalide";
    }
  }

  // Messages de validation Spotify Action
  if (selectedActionService.value?.name?.toLowerCase() === 'spotify') {
    const actionType = selectedAction.value?.name;
    if ((actionType === 'new_track_in_playlist' || actionType === 'playlist_updated') && !spotifyActionConfig.value?.playlistId) {
      return "Veuillez spécifier le Playlist ID Spotify";
    }
  }

  // Messages de validation Spotify Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'spotify') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'play_track' && !spotifyReactionConfig.value?.trackId) {
      return "Veuillez spécifier le Track ID Spotify pour jouer une piste";
    }
    if (reactionType === 'add_to_playlist' && !spotifyReactionConfig.value?.playlistId) {
      return "Veuillez spécifier le Playlist ID Spotify";
    }
    if (reactionType === 'create_playlist' && !spotifyReactionConfig.value?.playlistName) {
      return "Veuillez spécifier le nom de la playlist à créer";
    }
    if (reactionType === 'set_volume' && (spotifyReactionConfig.value?.volume === undefined || spotifyReactionConfig.value?.volume < 0 || spotifyReactionConfig.value?.volume > 100)) {
      return "Veuillez spécifier un volume entre 0 et 100";
    }
  }

  // Messages de validation Google Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'google') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'google_send_email') {
      if (!googleReactionConfig.value?.to) {
        return "Veuillez spécifier l'adresse email du destinataire";
      }
      if (!googleReactionConfig.value?.subject) {
        return "Veuillez spécifier le sujet de l'email";
      }
      if (!googleReactionConfig.value?.body) {
        return "Veuillez spécifier le contenu de l'email";
      }
    }
    if (reactionType === 'google_reply_to_email' && !googleReactionConfig.value?.body) {
      return "Veuillez spécifier le message de réponse";
    }
  }

  // Messages de validation Telegram Action
  if (selectedActionService.value?.name?.toLowerCase() === 'telegram') {
    const actionType = selectedAction.value?.name;
    if (actionType === 'new_message' && !telegramActionConfig.value?.chat_id?.trim()) {
      return "Veuillez spécifier le chat ID Telegram";
    }
    if (actionType === 'new_member' && !telegramActionConfig.value?.chat_id?.trim()) {
      return "Veuillez fournir le chat ID du groupe";
    }
    if (actionType === 'channel_post' && !telegramActionConfig.value?.channel_id?.trim()) {
      return "Veuillez spécifier le channel ID Telegram";
    }
  }

  // Messages de validation Telegram Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'telegram') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'send_message') {
      if (!telegramReactionConfig.value?.chat_id?.trim()) {
        return "Veuillez spécifier le chat ID Telegram";
      }
      if (!telegramReactionConfig.value?.message?.trim()) {
        return "Veuillez écrire le message à envoyer";
      }
    }
    if (reactionType === 'send_photo') {
      if (!telegramReactionConfig.value?.chat_id?.trim()) {
        return "Veuillez spécifier le chat ID Telegram";
      }
      if (!telegramReactionConfig.value?.photo_url?.trim()) {
        return "Veuillez indiquer l'URL de la photo à envoyer";
      }
    }
    if (reactionType === 'send_document') {
      if (!telegramReactionConfig.value?.chat_id?.trim()) {
        return "Veuillez spécifier le chat ID Telegram";
      }
      if (!telegramReactionConfig.value?.document_url?.trim()) {
        return "Veuillez indiquer l'URL du document à envoyer";
      }
    }
    if (reactionType === 'create_poll') {
      if (!telegramReactionConfig.value?.chat_id?.trim()) {
        return "Veuillez spécifier le chat ID Telegram";
      }
      if (!telegramReactionConfig.value?.question?.trim()) {
        return "Veuillez saisir la question du sondage";
      }
      if (!telegramReactionConfig.value?.options?.trim()) {
        return "Veuillez renseigner au moins deux options séparées par des virgules";
      }
    }
    if (reactionType === 'pin_message') {
      if (!telegramReactionConfig.value?.chat_id?.trim()) {
        return "Veuillez spécifier le chat ID Telegram";
      }
      if (!telegramReactionConfig.value?.message_id?.trim()) {
        return "Veuillez spécifier le message ID à épingler";
      }
    }
    if (reactionType === 'kick_user') {
      if (!telegramReactionConfig.value?.user_id?.trim()) {
        return "Veuillez spécifier l'ID de l'utilisateur à exclure";
      }
      if (telegramReactionConfig.value?.until_date !== null && telegramReactionConfig.value?.until_date !== undefined && Number.isNaN(telegramReactionConfig.value.until_date)) {
        return "Le timestamp de fin de bannissement doit être un nombre";
      }
    }
  }

  // Messages de validation Reddit Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'reddit') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'submit_post') {
      if (!redditReactionConfig.value?.subreddit) {
        return "Veuillez spécifier le subreddit";
      }
      if (!redditReactionConfig.value?.title) {
        return "Veuillez spécifier le titre du post";
      }
    }
    if (reactionType === 'submit_comment' && !redditReactionConfig.value?.text) {
      return "Veuillez spécifier le texte du commentaire";
    }
    if ((reactionType === 'subscribe_subreddit' || reactionType === 'unsubscribe_subreddit') && !redditReactionConfig.value?.subreddit) {
      return "Veuillez spécifier le subreddit";
    }
    if (reactionType === 'send_message') {
      if (!redditReactionConfig.value?.to) {
        return "Veuillez spécifier le destinataire";
      }
      if (!redditReactionConfig.value?.subject) {
        return "Veuillez spécifier le sujet du message";
      }
      if (!redditReactionConfig.value?.text) {
        return "Veuillez spécifier le contenu du message";
      }
    }
  }

  // Messages de validation Discord Action OAuth
  if (selectedActionService.value?.name?.toLowerCase() === 'discord' && selectedActionService.value?.type === 'oauth') {
    const actionType = selectedAction.value?.name;
    if (actionType === 'new_message_in_channel' && !discordActionConfig.value?.channelId) {
      return "Veuillez spécifier le Channel ID Discord";
    }
    if (actionType === 'new_member_joined' && !discordActionConfig.value?.guildId) {
      return "Veuillez spécifier le Server (Guild) ID Discord";
    }
    if (actionType === 'message_reaction_added') {
      if (!discordActionConfig.value?.channelId) {
        return "Veuillez spécifier le Channel ID Discord";
      }
      if (!discordActionConfig.value?.messageId) {
        return "Veuillez spécifier le Message ID Discord";
      }
    }
  }

  // Messages de validation Discord Reaction OAuth
  if (selectedReactionService.value?.name?.toLowerCase() === 'discord' && selectedReactionService.value?.type === 'oauth') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'send_message') {
      if (!discordReactionConfig.value?.channelId) {
        return "Veuillez spécifier le Channel ID Discord";
      }
      if (!discordReactionConfig.value?.messageContent) {
        return "Veuillez spécifier le contenu du message";
      }
    }
    if (reactionType === 'send_embed') {
      if (!discordReactionConfig.value?.channelId) {
        return "Veuillez spécifier le Channel ID Discord";
      }
      if (!discordReactionConfig.value?.embedTitle) {
        return "Veuillez spécifier le titre de l'embed";
      }
    }
    if (reactionType === 'send_dm') {
      if (!discordReactionConfig.value?.targetUserId) {
        return "Veuillez spécifier l'User ID du destinataire";
      }
      if (!discordReactionConfig.value?.messageContent) {
        return "Veuillez spécifier le contenu du message";
      }
    }
    if (reactionType === 'add_reaction') {
      if (!discordReactionConfig.value?.channelId) {
        return "Veuillez spécifier le Channel ID Discord";
      }
      if (!discordReactionConfig.value?.messageId) {
        return "Veuillez spécifier le Message ID";
      }
      if (!discordReactionConfig.value?.emoji) {
        return "Veuillez spécifier un emoji";
      }
    }
    if (reactionType === 'delete_message' || reactionType === 'pin_message') {
      if (!discordReactionConfig.value?.channelId) {
        return "Veuillez spécifier le Channel ID Discord";
      }
      if (!discordReactionConfig.value?.messageId) {
        return "Veuillez spécifier le Message ID";
      }
    }
  }

  // Messages de validation YouTube Reaction
  if (selectedReactionService.value?.name?.toLowerCase() === 'youtube') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'youtube_post_comment') {
      if (!youtubeReactionConfig.value?.videoId) {
        return "Veuillez spécifier le Video ID YouTube";
      }
      if (!youtubeReactionConfig.value?.comment) {
        return "Veuillez spécifier le texte du commentaire";
      }
    }
    if (reactionType === 'youtube_like_video' && !youtubeReactionConfig.value?.videoId) {
      return "Veuillez spécifier le Video ID YouTube à liker";
    }
    if (reactionType === 'youtube_add_to_playlist') {
      if (!youtubeReactionConfig.value?.playlistId) {
        return "Veuillez spécifier le Playlist ID YouTube";
      }
      if (!youtubeReactionConfig.value?.videoId) {
        return "Veuillez spécifier le Video ID YouTube";
      }
    }
    if (reactionType === 'youtube_create_playlist' && !youtubeReactionConfig.value?.playlistName) {
      return "Veuillez spécifier le nom de la playlist à créer";
    }
    if (reactionType === 'youtube_subscribe_channel' && !youtubeReactionConfig.value?.channelId) {
      return "Veuillez spécifier le Channel ID YouTube";
    }
  }

  if (selectedActionService.value?.name?.toLowerCase() === 'notion') {
    const actionType = selectedAction.value?.name;
    if (actionType === 'notion_database_entry_added' && !notionActionConfig.value?.database_id) {
      return "Veuillez indiquer l'identifiant de la base de données Notion (32 caractères)";
    }
    if (actionType === 'notion_page_updated' && !notionActionConfig.value?.page_id) {
      return "Veuillez indiquer l'identifiant de la page Notion à surveiller";
    }
  }

  if (selectedReactionService.value?.name?.toLowerCase() === 'notion') {
    const reactionType = selectedReaction.value?.name;
    if (reactionType === 'notion_create_page') {
      if (!notionReactionConfig.value?.parent_id) {
        return "Veuillez indiquer l'ID du parent (page ou base) où créer la page";
      }
      if (!notionReactionConfig.value?.properties) {
        return "Veuillez fournir les propriétés de la page au format JSON";
      }
      if (notionReactionConfig.value?.properties && !isValidJson(notionReactionConfig.value.properties)) {
        return "Le champ Propriétés doit contenir un JSON valide";
      }
      if (notionReactionConfig.value?.children && !isValidJson(notionReactionConfig.value.children)) {
        return "Le champ Contenu (blocks) doit contenir un JSON valide";
      }
    }
    if (reactionType === 'notion_database_add_entry') {
      if (!notionReactionConfig.value?.database_id) {
        return "Veuillez indiquer l'ID de la base de données cible";
      }
      if (!notionReactionConfig.value?.properties) {
        return "Veuillez fournir les propriétés de l'entrée au format JSON";
      }
      if (notionReactionConfig.value?.properties && !isValidJson(notionReactionConfig.value.properties)) {
        return "Le champ Propriétés doit contenir un JSON valide";
      }
      if (notionReactionConfig.value?.children && !isValidJson(notionReactionConfig.value.children)) {
        return "Le champ Contenu (blocks) doit contenir un JSON valide";
      }
    }
    if (reactionType === 'notion_update_page') {
      if (!notionReactionConfig.value?.page_id) {
        return "Veuillez indiquer l'ID de la page à mettre à jour";
      }
      if (!notionReactionConfig.value?.properties) {
        return "Veuillez fournir les propriétés à mettre à jour au format JSON";
      }
      if (notionReactionConfig.value?.properties && !isValidJson(notionReactionConfig.value.properties)) {
        return "Le champ Propriétés doit contenir un JSON valide";
      }
    }
  }

  return "";
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

const isOAuthService = (service) => {
  return (service?.type || "").toLowerCase() === "oauth";
};

const isServiceConnected = (serviceName) => {
  if (!serviceName) {
    return false;
  }

  const normalized = serviceName.toLowerCase();
  return connectedOAuthTokens.value.some(
    (token) => token.serviceName?.toLowerCase() === normalized
  );
};

const ensureServiceAccess = (service) => {
  if (!service || !isOAuthService(service) || isServiceConnected(service.name)) {
    return true;
  }

  toast.add({
    title: "Service requis",
    description: `Vous n'êtes pas connecté au service "${service.name}".`,
    color: "red",
  });

  navigateTo("/services");
  return false;
};

const loadServices = async () => {
  try {
    // Charger les services depuis about.json
    const aboutPromise = $fetch("/about.json", {
      baseURL: config.public.apiBaseUrl,
    });

    const authHeaders = buildAuthHeaders();

    const servicesPromise = $fetch("/api/areas/services", {
      baseURL: config.public.apiBaseUrl,
      headers: authHeaders,
    }).catch(() => null);

    const tokensPromise = authCookie.value
      ? $fetch("/auth/oauth/tokens", {
          baseURL: config.public.apiBaseUrl,
          headers: authHeaders,
        }).catch((error) => {
          console.error("[Create AREA] Erreur chargement tokens OAuth:", error);
          return null;
        })
      : Promise.resolve(null);

    const [aboutData, servicesResponse, tokensResponse] = await Promise.all([
      aboutPromise,
      servicesPromise,
      tokensPromise,
    ]);

    if (Array.isArray(tokensResponse?.data)) {
      connectedOAuthTokens.value = tokensResponse.data;
    } else if (Array.isArray(tokensResponse)) {
      connectedOAuthTokens.value = tokensResponse;
    } else {
      connectedOAuthTokens.value = [];
    }

    const servicesData = servicesResponse?.data || servicesResponse;

    if (aboutData.server?.services && servicesData) {
      // Mapper les services avec leurs IDs
      availableServices.value = aboutData.server.services.map(service => {
        const dbService = servicesData.find(s => s.name.toLowerCase() === service.name.toLowerCase());

        return {
          ...service,
          id: dbService?.id,
          actions: service.actions?.map(action => {
            const dbAction = dbService?.actions?.find(a => a.name === action.name);
            return {
              ...action,
              id: dbAction?.id,
            };
          }) || [],
          reactions: service.reactions?.map(reaction => {
            const dbReaction = dbService?.reactions?.find(r => r.name === reaction.name);
            return {
              ...reaction,
              id: dbReaction?.id,
            };
          }) || [],
        };
      });
    } else {
      availableServices.value = aboutData.server?.services || getDefaultServices();
    }

    console.log('Loaded services:', availableServices.value);
  } catch (error) {
    console.error("Erreur lors du chargement des services:", error);
    availableServices.value = getDefaultServices();
  }
};

const getDefaultServices = () => [
  {
    name: "Gmail",
    type: "oauth",
    actions: [
      { name: "new_email", description: "Nouvel email reçu" },
      { name: "email_with_attachment", description: "Email avec pièce jointe" },
      { name: "starred_email", description: "Email marqué comme important" },
    ],
    reactions: [
      { name: "send_email", description: "Envoyer un email" },
      { name: "forward_email", description: "Transférer un email" },
    ],
  },
  {
    name: "Google",
    type: "oauth",
    actions: [
      { name: "google_new_email", description: "Nouvel email Gmail" },
      { name: "google_new_event", description: "Nouvel événement Google Calendar" },
      { name: "google_drive_file_added", description: "Nouveau fichier Google Drive" },
    ],
    reactions: [
      { name: "google_send_email", description: "Envoyer un email via Gmail" },
      { name: "google_drive_create_file", description: "Créer un fichier sur Google Drive" },
      { name: "google_calendar_create_event", description: "Créer un événement Google Calendar" },
    ],
  },
  {
    name: "Slack",
    type: "oauth",
    actions: [
      { name: "new_message", description: "Nouveau message" },
      { name: "mention", description: "Mention reçue" },
    ],
    reactions: [
      { name: "send_message", description: "Envoyer un message" },
      { name: "create_channel", description: "Créer un canal" },
    ],
  },
  {
    name: "GitHub",
    type: "oauth",
    actions: [
      { name: "new_issue", description: "Nouvelle issue créée" },
      { name: "push", description: "Nouveau push sur une branche" },
      { name: "pull_request", description: "Nouvelle pull request" },
    ],
    reactions: [
      { name: "create_issue", description: "Créer une issue" },
      { name: "comment", description: "Ajouter un commentaire" },
      { name: "create_branch", description: "Créer une branche" },
    ],
  },
  {
    name: "Discord",
    type: "oauth",
    actions: [
      { name: "new_message", description: "Nouveau message" },
    ],
    reactions: [
      { name: "send_message", description: "Envoyer un message" },
      { name: "send_embed", description: "Envoyer un message enrichi" },
    ],
  },
  {
    name: "Telegram",
    type: "bot",
    actions: [
      { name: "new_message", description: "Nouveau message dans un chat" },
      { name: "new_member", description: "Nouveau membre rejoint" },
      { name: "bot_command", description: "Commande reçue par le bot" },
      { name: "channel_post", description: "Nouvelle publication de canal" },
      { name: "poll_created", description: "Création d'un sondage" },
    ],
    reactions: [
      { name: "send_message", description: "Envoyer un message texte" },
      { name: "send_photo", description: "Envoyer une photo" },
      { name: "send_document", description: "Envoyer un document" },
      { name: "create_poll", description: "Créer un sondage" },
      { name: "pin_message", description: "Epingler un message" },
      { name: "kick_user", description: "Exclure un utilisateur" },
    ],
  },
  {
    name: "OneDrive",
    type: "oauth",
    actions: [
      { name: "new_file", description: "Nouveau fichier ajouté" },
      { name: "file_modified", description: "Fichier modifié" },
    ],
    reactions: [
      { name: "upload_file", description: "Uploader un fichier" },
      { name: "create_folder", description: "Créer un dossier" },
    ],
  },
  {
    name: "Timer",
    type: "internal",
    actions: [
      { name: "every_minute", description: "Chaque minute" },
      { name: "every_hour", description: "Chaque heure" },
      { name: "every_day", description: "Chaque jour à une heure précise" },
      { name: "every_week", description: "Chaque semaine" },
    ],
    reactions: [],
  },
];

const selectActionService = (service) => {
  if (!ensureServiceAccess(service)) {
    return;
  }

  selectedActionService.value = service;
  selectedAction.value = null;
};

const selectAction = (action) => {
  selectedAction.value = action;
};

const selectReactionService = (service) => {
  if (!ensureServiceAccess(service)) {
    return;
  }

  selectedReactionService.value = service;
  selectedReaction.value = null;
};

const selectReaction = (reaction) => {
  selectedReaction.value = reaction;
};

const nextStep = () => {
  if (step.value < steps.length - 1) {
    step.value++;
  }
};

const previousStep = () => {
  if (step.value > 0) {
    step.value--;
  }
};

const createArea = async () => {
  if (!isConfigValid.value) return;

  if (!ensureServiceAccess(selectedActionService.value)) {
    return;
  }

  if (!ensureServiceAccess(selectedReactionService.value)) {
    return;
  }

  creating.value = true;

  try {
    // Construire la config selon le type d'action/réaction
    const areaConfig = {};

    // Config Timer
    if (selectedActionService.value?.name?.toLowerCase() === 'timer') {
      if (selectedAction.value?.name === 'timer_time') {
        areaConfig.timerType = 'time';
        areaConfig.targetTime = timerConfig.value.targetTime;
        areaConfig.checkInterval = timerConfig.value.checkInterval || 60;
      } else if (selectedAction.value?.name === 'timer_date') {
        areaConfig.timerType = 'date';
        areaConfig.targetDate = timerConfig.value.targetDate;
        areaConfig.checkInterval = timerConfig.value.checkInterval || 3600;
      }
    }

    // Config Discord Webhook
    if (selectedReactionService.value?.name?.toLowerCase() === 'discord' && selectedReaction.value?.name === 'discord_webhook') {
      areaConfig.discordWebhookUrl = discordConfig.value.webhookUrl;
      areaConfig.discordTitle = discordConfig.value.title;
      areaConfig.discordColor = discordConfig.value.color;
    }

    // Config Spotify Action
    if (selectedActionService.value?.name?.toLowerCase() === 'spotify') {
      // Fusionner directement la config Spotify dans areaConfig (pas dans un sous-objet)
      Object.assign(areaConfig, spotifyActionConfig.value);
    }

    // Config Spotify Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'spotify') {
      // Fusionner directement la config Spotify dans areaConfig (pas dans un sous-objet)
      Object.assign(areaConfig, spotifyReactionConfig.value);
    }

    // Config Google Action
    if (selectedActionService.value?.name?.toLowerCase() === 'google') {
      // Fusionner directement la config Google dans areaConfig
      Object.assign(areaConfig, googleActionConfig.value);
    }

    // Config Google Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'google') {
      // Fusionner directement la config Google dans areaConfig
      Object.assign(areaConfig, googleReactionConfig.value);
    }

    // Config Telegram Action
    if (selectedActionService.value?.name?.toLowerCase() === 'telegram') {
      Object.assign(areaConfig, telegramActionConfig.value);
    }

    // Config Telegram Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'telegram') {
      Object.assign(areaConfig, telegramReactionConfig.value);
    }
    // Config Reddit Action
    if (selectedActionService.value?.name?.toLowerCase() === 'reddit') {
      // Fusionner directement la config Reddit dans areaConfig
      Object.assign(areaConfig, redditActionConfig.value);
    }

    // Config Reddit Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'reddit') {
      // Fusionner directement la config Reddit dans areaConfig
      Object.assign(areaConfig, redditReactionConfig.value);
    }

    // Config Discord Action OAuth
    if (selectedActionService.value?.name?.toLowerCase() === 'discord' && selectedActionService.value?.type === 'oauth') {
      Object.assign(areaConfig, discordActionConfig.value);
    }

    // Config Discord Reaction OAuth
    if (selectedReactionService.value?.name?.toLowerCase() === 'discord' && selectedReactionService.value?.type === 'oauth') {
      Object.assign(areaConfig, discordReactionConfig.value);
    }

    // Config GitHub Action
    if (selectedActionService.value?.name?.toLowerCase() === 'github') {
      // Fusionner directement la config GitHub dans areaConfig
      Object.assign(areaConfig, githubActionConfig.value);
    }

    // Config GitHub Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'github') {
      // Fusionner directement la config GitHub dans areaConfig
      Object.assign(areaConfig, githubReactionConfig.value);
    }

    // Config GitLab Action
    if (selectedActionService.value?.name?.toLowerCase() === 'gitlab') {
      // Fusionner directement la config GitLab dans areaConfig
      Object.assign(areaConfig, gitlabActionConfig.value);
    }

    // Config GitLab Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'gitlab') {
      // Fusionner directement la config GitLab dans areaConfig
      Object.assign(areaConfig, gitlabReactionConfig.value);
    }

    // Config OpenAI Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'openai') {
      // Fusionner directement la config OpenAI dans areaConfig
      Object.assign(areaConfig, openaiReactionConfig.value);
    }

    // Config YouTube Action
    if (selectedActionService.value?.name?.toLowerCase() === 'youtube') {
      // Fusionner directement la config YouTube dans areaConfig
      Object.assign(areaConfig, youtubeActionConfig.value);
    }

    // Config YouTube Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'youtube') {
      // Fusionner directement la config YouTube dans areaConfig
      Object.assign(areaConfig, youtubeReactionConfig.value);
    }

    // Config Notion Action
    if (selectedActionService.value?.name?.toLowerCase() === 'notion') {
      Object.assign(areaConfig, sanitizeConfig(notionActionConfig.value));
    }

    // Config Notion Reaction
    if (selectedReactionService.value?.name?.toLowerCase() === 'notion') {
      Object.assign(areaConfig, sanitizeConfig(notionReactionConfig.value));
    }

    // Le backend attend actionId et reactionId (IDs numériques de la base)
    // On doit les récupérer en fonction des noms
    const newArea = {
      actionId: selectedAction.value.id,
      reactionId: selectedReaction.value.id,
      config: areaConfig,
    };

    console.log('Creating AREA with config:', newArea);

    await $fetch("/api/areas", {
      method: "POST",
      baseURL: config.public.apiBaseUrl,
      headers: buildAuthHeaders(),
      body: newArea,
    });

    // Rediriger vers la liste des AREAs
    navigateTo("/areas");
  } catch (error) {
    console.error("Erreur lors de la création de l'AREA:", error);
    alert(`Erreur lors de la création de l'AREA: ${error.message || 'Veuillez réessayer.'}`);
  } finally {
    creating.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadServices();
});
</script>
