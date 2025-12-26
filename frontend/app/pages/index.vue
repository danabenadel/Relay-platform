<!-- app/pages/index.vue -->
<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden"
  >
    <!-- Skip Links pour navigation rapide -->
    <SkipLinks />

    <!-- Background animated elements -->
    <div class="absolute inset-0" aria-hidden="true">
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
      ></div>
      <div
        class="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"
      ></div>
    </div>

    <!-- Navigation moderne -->
    <nav
      id="navigation"
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="{ 'bg-slate-900/80 backdrop-blur-2xl shadow-lg shadow-blue-500/10': isScrolled, 'bg-transparent': !isScrolled }"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-3 group cursor-pointer" aria-label="Retour à l'accueil Relay">
            <div class="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/20 group-hover:ring-blue-400/50 transition-all duration-300">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 group-hover:scale-110 transition-transform duration-500"></div>
              <img src='assets/logo.jpeg' alt='Logo Relay' class='relative w-full h-full object-cover mix-blend-overlay opacity-90' />
            </div>
            <span class="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">Relay</span>
          </NuxtLink>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-2" role="menubar" aria-label="Menu principal">
            <!-- Colorblind Selector -->
            <ColorblindSelector />

            <!-- Auth Buttons -->
            <NuxtLink
              to="/login"
              class="px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Se connecter à votre compte"
            >
              Connexion
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Créer un compte gratuitement"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
              <span class="relative flex items-center gap-2">
                Commencer
                <Icon name="mdi:arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </NuxtLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            :aria-label="mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
          >
            <Icon :name="mobileMenuOpen ? 'mdi:close' : 'mdi:menu'" class="w-6 h-6 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="mobileMenuOpen"
        id="mobile-menu"
        class="md:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-white/10"
        role="menu"
        aria-label="Menu mobile"
      >
        <div class="px-4 py-6 space-y-3">
          <div class="flex justify-center mb-3">
            <ColorblindSelector />
          </div>
          <NuxtLink
            to="/login"
            class="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
            role="menuitem"
            aria-label="Se connecter à votre compte"
          >
            Connexion
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="block px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-center shadow-lg shadow-blue-500/30 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            role="menuitem"
            aria-label="Créer un compte gratuitement"
          >
            Commencer gratuitement
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main id="main-content" class="relative z-10 pt-20" role="main">
      <section class="px-4 py-24 md:py-32" aria-labelledby="hero-title">
        <div class="max-w-7xl mx-auto">
          <!-- Hero moderne avec layout asymétrique -->
          <div class="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <!-- Colonne gauche - Contenu principal -->
            <div class="text-left space-y-8">
              <!-- Badge moderne -->
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-sm text-white/90 hover:bg-white/15 transition-all duration-300 cursor-default group" role="status" aria-label="Service actif">
                <span class="flex h-2 w-2 relative" aria-hidden="true">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span class="font-medium">100% gratuit · Sans limite</span>
              </div>

              <!-- Titre principal ultra moderne -->
              <div class="space-y-4">
                <h1 id="hero-title" class="text-5xl md:text-7xl font-black leading-tight">
                  <span class="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    Automatisez
                  </span>
                  <br />
                  <span class="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent inline-flex items-center gap-4">
                    l'impossible
                  </span>
                </h1>
                <p class="text-xl md:text-2xl text-blue-200/90 leading-relaxed max-w-xl">
                  Connectez vos apps, créez des workflows intelligents.
                  <span class="text-white font-semibold">Zéro code, maximum d'impact.</span>
                </p>
              </div>

              <!-- Tags/Keywords modernes -->
              <div class="flex flex-wrap gap-3" role="list" aria-label="Caractéristiques principales">
                <span class="px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-sm text-blue-200 border border-blue-400/30 font-medium" role="listitem">
                  IF → THEN
                </span>
                <span class="px-4 py-2 bg-indigo-500/20 backdrop-blur-sm rounded-full text-sm text-indigo-200 border border-indigo-400/30 font-medium" role="listitem">
                  Multi-services
                </span>
                <span class="px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full text-sm text-purple-200 border border-purple-400/30 font-medium" role="listitem">
                  Temps réel
                </span>
              </div>

              <!-- CTA Buttons améliorés -->
              <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <NuxtLink
                  to="/login"
                  class="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  aria-label="Démarrer gratuitement avec Relay"
                >
                  <span class="relative z-10 flex items-center justify-center gap-2">
                    Démarrer gratuitement
                    <svg
                      class="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
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
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
                  <!-- Effet brillant qui traverse -->
                  <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden="true"></div>
                </NuxtLink>

                <NuxtLink
                  to="/services"
                  class="group relative border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-bold backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:-translate-y-1 focus:ring-2 focus:ring-white focus:outline-none"
                  aria-label="Explorer tous les services disponibles"
                >
                  <span class="flex items-center justify-center gap-2">
                    <Icon name="mdi:apps" class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
                    Explorer les services
                  </span>
                </NuxtLink>
              </div>
            </div>

            <!-- Colonne droite - Visual/Demo interactif -->
            <div class="relative">
              <div class="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 group" role="region" aria-label="Démo interactive de workflow">
                <!-- Badge "Live Demo" -->
                <div class="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2" role="status" aria-label="Démo en direct">
                  <span class="flex h-2 w-2" aria-hidden="true">
                    <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Demo Live
                </div>

                <!-- Contenu du workflow -->
                <div
                  class="space-y-6"
                  @click="triggerWorkflowAnimation"
                  role="button"
                  tabindex="0"
                  @keydown.enter="triggerWorkflowAnimation"
                  @keydown.space.prevent="triggerWorkflowAnimation"
                  :aria-label="workflowStep === 0 ? 'Cliquez pour lancer la démo du workflow' : workflowStep < 3 ? 'Automation en cours' : 'Démo terminée'"
                >
                  <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-white mb-2">Workflow en Action</h3>
                    <p class="text-blue-200 text-sm">Cliquez pour voir la magie opérer</p>
                  </div>

                  <!-- Workflow steps en vertical moderne -->
                  <div class="space-y-4">
                    <!-- Step 1 -->
                    <div
                      class="relative flex items-center gap-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-2xl p-4 border border-blue-500/30 transition-all duration-500 cursor-pointer"
                      :class="{ 'scale-105 shadow-xl shadow-blue-500/30 border-blue-400': workflowStep >= 1 }"
                    >
                      <div class="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Icon name="mdi:github" class="w-8 h-8 text-blue-300" />
                      </div>
                      <div class="flex-1">
                        <div class="font-bold text-white">GitHub Push</div>
                        <div class="text-sm text-blue-200">Déclencheur</div>
                      </div>
                      <div class="px-3 py-1 bg-blue-500/30 rounded-full text-xs text-white font-bold">IF</div>
                      <div v-if="workflowStep >= 1" class="absolute -right-1 -top-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    </div>

                    <!-- Connector animated -->
                    <div class="flex justify-center">
                      <div class="w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-purple-500/50 relative" :class="{ 'animate-pulse': workflowStep >= 2 }">
                        <Icon name="mdi:arrow-down" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                      </div>
                    </div>

                    <!-- Step 2 -->
                    <div
                      class="relative flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-4 border border-purple-500/30 transition-all duration-500"
                      :class="{ 'scale-105 shadow-xl shadow-purple-500/30 border-purple-400': workflowStep >= 2 }"
                    >
                      <div class="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Icon name="mdi:cog" class="w-8 h-8 text-purple-300" :class="{ 'animate-spin': workflowStep >= 2 }" />
                      </div>
                      <div class="flex-1">
                        <div class="font-bold text-white">Relay Process</div>
                        <div class="text-sm text-purple-200">Traitement</div>
                      </div>
                      <div class="px-3 py-1 bg-purple-500/30 rounded-full text-xs text-white font-bold">PROCESS</div>
                    </div>

                    <!-- Connector animated -->
                    <div class="flex justify-center">
                      <div class="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-indigo-500/50 relative" :class="{ 'animate-pulse': workflowStep >= 3 }">
                        <Icon name="mdi:arrow-down" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                      </div>
                    </div>

                    <!-- Step 3 -->
                    <div
                      class="relative flex items-center gap-4 bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 rounded-2xl p-4 border border-indigo-500/30 transition-all duration-500"
                      :class="{ 'scale-105 shadow-xl shadow-indigo-500/30 border-indigo-400': workflowStep >= 3 }"
                    >
                      <div class="flex-shrink-0 w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Icon name="mdi:slack" class="w-8 h-8 text-indigo-300" />
                      </div>
                      <div class="flex-1">
                        <div class="font-bold text-white">Slack Message</div>
                        <div class="text-sm text-indigo-200">Action</div>
                      </div>
                      <div class="px-3 py-1 bg-indigo-500/30 rounded-full text-xs text-white font-bold">THEN</div>
                      <div v-if="workflowStep >= 3" class="absolute -right-1 -top-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="text-center mt-6 pt-6 border-t border-white/10" role="status" aria-live="polite" aria-atomic="true">
                    <div v-if="workflowStep === 0" class="text-white/60 text-sm flex items-center justify-center gap-2">
                      <Icon name="mdi:gesture-tap" class="w-5 h-5 animate-bounce" aria-hidden="true" />
                      Cliquez pour lancer
                    </div>
                    <div v-else-if="workflowStep < 3" class="text-blue-300 text-sm font-medium flex items-center justify-center gap-2">
                      <Icon name="mdi:loading" class="w-5 h-5 animate-spin" aria-hidden="true" />
                      Automatisation en cours...
                    </div>
                    <div v-else class="space-y-2">
                      <div class="text-green-400 text-sm font-bold flex items-center justify-center gap-2">
                        <Icon name="mdi:check-circle" class="w-5 h-5" aria-hidden="true" />
                        Terminé avec succès !
                      </div>
                      <button
                        @click.stop="resetWorkflow"
                        class="text-blue-300 hover:text-blue-200 text-sm underline transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none rounded px-2 py-1"
                        aria-label="Relancer l'animation du workflow"
                      >
                        Relancer l'animation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- Carrousel des services populaires -->
      <section class="py-20 relative overflow-hidden bg-gradient-to-b from-transparent via-blue-900/20 to-transparent" aria-labelledby="services-title">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-xl rounded-full border border-cyan-400/30 text-sm text-cyan-200 mb-6" role="status">
              <Icon name="mdi:star" class="w-4 h-4" aria-hidden="true" />
              <span class="font-semibold">Services populaires</span>
            </div>
            <h2 id="services-title" class="text-4xl md:text-5xl font-bold text-white mb-6">
              Ils font déjà confiance à Relay
            </h2>
            <p class="text-xl text-blue-300">
              Connectez vos applications préférées en un clic
            </p>
          </div>

          <!-- Infinite Carousel -->
          <div class="relative" role="region" aria-label="Carrousel des services supportés">
            <div class="carousel-container">
              <div class="carousel-track" role="list" aria-label="Liste des services populaires">
                <!-- First set of services -->
                <div
                  v-for="(service, index) in popularServices"
                  :key="`service-1-${index}`"
                  class="carousel-item group text-center cursor-pointer flex-shrink-0"
                  role="listitem"
                  :aria-label="`Service ${service.name}`"
                >
                  <div
                    class="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-3 border border-white/20 group-hover:bg-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-xl"
                  >
                    <Icon :name="service.icon" :aria-label="`Icône ${service.name}`" />
                  </div>
                  <div
                    class="text-sm font-medium text-white/70 group-hover:text-white transition-colors"
                  >
                    {{ service.name }}
                  </div>
                </div>
                <!-- Duplicate set for infinite effect -->
                <div
                  v-for="(service, index) in popularServices"
                  :key="`service-2-${index}`"
                  class="carousel-item group text-center cursor-pointer flex-shrink-0"
                  role="listitem"
                  :aria-label="`Service ${service.name}`"
                  aria-hidden="true"
                >
                  <div
                    class="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-3 border border-white/20 group-hover:bg-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-xl"
                  >
                    <Icon :name="service.icon" />
                  </div>
                  <div
                    class="text-sm font-medium text-white/70 group-hover:text-white transition-colors"
                  >
                    {{ service.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section Pourquoi Relay modernisée -->
      <section class="py-20 relative" aria-labelledby="features-title">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-xl rounded-full border border-indigo-400/30 text-sm text-indigo-200 mb-6" role="status">
              <Icon name="mdi:star" class="w-4 h-4" aria-hidden="true" />
              <span class="font-semibold">Pourquoi choisir Relay</span>
            </div>
            <h2 id="features-title" class="text-4xl md:text-6xl font-bold text-white mb-6">
              Une expérience
              <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> incomparable</span>
            </h2>
            <p class="text-xl text-blue-300 max-w-2xl mx-auto">
              L'automatisation n'a jamais été aussi puissante et accessible
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8" role="list" aria-label="Caractéristiques principales de Relay">
            <!-- Card 1 -->
            <article class="group relative" role="listitem">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" aria-hidden="true"></div>
              <div class="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 h-full">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl" aria-hidden="true">
                  <Icon name="mdi:lightning-bolt" class="w-10 h-10 text-white" aria-hidden="true" />
                </div>
                <h3 class="text-2xl font-bold text-white mb-4 text-center">
                  Ultra Simple
                </h3>
                <p class="text-blue-200/90 leading-relaxed text-center">
                  Créez des automatisations complexes en quelques clics. Interface drag & drop intuitive, aucune ligne de code nécessaire.
                </p>
                <div class="mt-6 flex justify-center">
                  <span class="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300 font-medium" role="status">
                    No-code
                  </span>
                </div>
              </div>
            </article>

            <!-- Card 2 -->
            <article class="group relative" role="listitem">
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" aria-hidden="true"></div>
              <div class="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-indigo-400/50 transition-all duration-500 hover:scale-105 h-full">
                <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl" aria-hidden="true">
                  <Icon name="mdi:connection" class="w-10 h-10 text-white" aria-hidden="true" />
                </div>
                <h3 class="text-2xl font-bold text-white mb-4 text-center">
                  Hyper Connecté
                </h3>
                <p class="text-blue-200/90 leading-relaxed text-center">
                  Plus de 12 services supportés. Gmail, GitHub, Slack, Discord et bien plus. Tout connecté en un seul endroit.
                </p>
                <div class="mt-6 flex justify-center gap-2">
                  <span class="px-3 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-300 font-medium" role="status">
                    12+ services
                  </span>
                </div>
              </div>
            </article>

            <!-- Card 3 -->
            <article class="group relative" role="listitem">
              <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" aria-hidden="true"></div>
              <div class="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 h-full">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl" aria-hidden="true">
                  <Icon name="mdi:rocket-launch" class="w-10 h-10 text-white" aria-hidden="true" />
                </div>
                <h3 class="text-2xl font-bold text-white mb-4 text-center">
                  Surpuissant
                </h3>
                <p class="text-blue-200/90 leading-relaxed text-center">
                  Workflows en temps réel, exécution instantanée. Gagnez des heures chaque jour grâce à l'automatisation intelligente.
                </p>
                <div class="mt-6 flex justify-center">
                  <span class="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300 font-medium" role="status">
                    Temps réel
                  </span>
                </div>
              </div>
            </article>
          </div>

          <!-- CTA Section -->
          <div class="mt-20 text-center">
            <div class="relative inline-block">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-30" aria-hidden="true"></div>
              <div class="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20" role="region" aria-labelledby="cta-title">
                <h3 id="cta-title" class="text-3xl md:text-4xl font-bold text-white mb-4">
                  Prêt à automatiser votre vie ?
                </h3>
                <p class="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
                  Rejoignez des milliers d'utilisateurs qui ont déjà simplifié leur quotidien
                </p>
                <NuxtLink
                  to="/login"
                  class="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  aria-label="Commencer maintenant avec Relay"
                >
                  <Icon name="mdi:rocket-launch" class="w-6 h-6 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                  Commencer maintenant
                  <svg
                    class="w-6 h-6 group-hover:translate-x-2 transition-transform"
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
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer moderne -->
    <footer id="footer" class="relative z-10 bg-gradient-to-t from-slate-900/50 to-transparent backdrop-blur-xl border-t border-white/10 py-16" role="contentinfo" aria-label="Pied de page">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
          <!-- Brand Column -->
          <div class="md:col-span-2">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span class="text-white font-bold text-xl">R</span>
              </div>
              <span class="text-2xl font-bold text-white">Relay</span>
            </div>
            <p class="text-blue-200/80 mb-6 max-w-md">
              L'outil d'automatisation nouvelle génération. Connectez vos services, créez des workflows intelligents, gagnez du temps.
            </p>
          </div>

          <!-- Quick Links -->
          <nav aria-label="Navigation du pied de page">
            <h4 class="text-white font-bold mb-4 text-lg">Navigation</h4>
            <ul class="space-y-3">
              <li>
                <NuxtLink
                  to="/login"
                  class="text-blue-200/70 hover:text-white transition-colors flex items-center gap-2 group focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  aria-label="Aller à la page de connexion"
                >
                  <Icon name="mdi:chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  Connexion
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/services"
                  class="text-blue-200/70 hover:text-white transition-colors flex items-center gap-2 group focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  aria-label="Voir tous les services"
                >
                  <Icon name="mdi:chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  Services
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/areas"
                  class="text-blue-200/70 hover:text-white transition-colors flex items-center gap-2 group focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  aria-label="Gérer vos AREAs"
                >
                  <Icon name="mdi:chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  AREAs
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/dashboard"
                  class="text-blue-200/70 hover:text-white transition-colors flex items-center gap-2 group focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
                  aria-label="Accéder au tableau de bord"
                >
                  <Icon name="mdi:chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  Dashboard
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
        <!-- Bottom bar -->
        <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
useHead({
  title: "Accueil - Relay",
  meta: [
    {
      name: "description",
      content:
        "Automatisez vos tâches avec Relay, connectez vos services préférés comme IFTTT et Zapier",
    },
  ],
});

// Navigation state
const mobileMenuOpen = ref(false);
const isScrolled = ref(false);

// Detect scroll for navbar background
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
  };
  window.addEventListener('scroll', handleScroll);
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  // Charger les services
  loadServices();
});

// Services populaires à afficher
const popularServices = ref([
  { name: "Gmail", icon: "mdi:gmail", color: "text-red-500" },
  { name: "GitHub", icon: "mdi:github", color: "text-gray-300" },
  { name: "Slack", icon: "mdi:slack", color: "text-purple-400" },
  { name: "Google", icon: "mdi:google", color: "text-red-500" },
  { name: "Facebook", icon: "mdi:facebook", color: "text-blue-500" },
  { name: "OneDrive", icon: "mdi:microsoft-onedrive", color: "text-blue-400" },
  { name: "Dropbox", icon: "mdi:dropbox", color: "text-blue-500" },
  { name: "Timer", icon: "mdi:timer", color: "text-cyan-400" },
  { name: "Discord", icon: "mdi:discord", color: "text-indigo-400" },
  { name: "Spotify", icon: "mdi:spotify", color: "text-green-500" },
  { name: "YouTube", icon: "mdi:youtube", color: "text-red-600" },
  { name: "Instagram", icon: "mdi:instagram", color: "text-pink-500" },
  { name: "Notion", icon: "simple-icons:notion", color: "text-slate-200" },
]);

// Services détaillés depuis l'API
const config = useRuntimeConfig();
const detailedServices = ref([]);

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

const getServiceIcon = (serviceName) => {
  return serviceIcons[serviceName?.toLowerCase()] || "mdi:puzzle";
};

// Charger les services depuis l'API
const loadServices = async () => {
  try {
    const response = await $fetch("/about.json", {
      baseURL: config.public.apiBaseUrl,
    });

    if (response.server?.services) {
      detailedServices.value = response.server.services;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des services:", error);
  }
};

// Animation du workflow interactif
const workflowStep = ref(0);
let workflowTimeout = null;

const triggerWorkflowAnimation = () => {
  if (workflowStep.value > 0) return; // Éviter le double clic

  // Réinitialiser
  workflowStep.value = 0;

  // Séquence d'animation
  setTimeout(() => { workflowStep.value = 1; }, 200);
  setTimeout(() => { workflowStep.value = 2; }, 1000);
  setTimeout(() => { workflowStep.value = 3; }, 2200);

  // Reset automatique après 5 secondes
  workflowTimeout = setTimeout(() => {
    workflowStep.value = 0;
  }, 5000);
};

const resetWorkflow = () => {
  if (workflowTimeout) {
    clearTimeout(workflowTimeout);
  }
  workflowStep.value = 0;
};
</script>

<style scoped>
/* Animations avancées */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

/* Infinite Carousel Styles - Amélioré */
.carousel-container {
  overflow: hidden;
  position: relative;
  width: 100%;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
}

.carousel-track {
  display: flex;
  gap: 3rem;
  animation: scroll 40s linear infinite;
  width: fit-content;
  will-change: transform;
}

.carousel-track:hover {
  animation-play-state: paused;
}

.carousel-item {
  width: 120px;
  padding: 1rem;
  flex-shrink: 0;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* Effet de brillance sur les boutons */
@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Smooth transitions globales */
* {
  scroll-behavior: smooth;
}

/* Hover effects améliorés */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:rotate-6 {
  transform: rotate(6deg) scale(1.1);
}

/* Animation du background */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Responsive improvements */
@media (max-width: 768px) {
  .carousel-item {
    width: 100px;
    padding: 0.5rem;
  }

  .carousel-track {
    gap: 2rem;
  }
}

/* Accessibility - Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .carousel-track {
    animation: none;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>
