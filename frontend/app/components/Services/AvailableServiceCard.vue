<!-- components/Services/AvailableServiceCard.vue -->
<template>
  <div
    class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group hover:border-white/30"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div
          :class="getServiceIconClass(service.name)"
          class="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
        >
          <Icon :name="getServiceIcon(service.name)" class="w-8 h-8" />
        </div>
        <div>
          <h3 class="font-bold text-lg text-white capitalize">
            {{ service.name }}
          </h3>
          <p class="text-sm text-white/60">
            {{ service.type === 'oauth' ? 'Authentification OAuth' : 'Service' }}
          </p>
        </div>
      </div>

      <!-- Badge "Nouveau" si applicable -->
      <div
        v-if="service.isNew"
        class="px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-300 border-blue-500/30"
      >
        Nouveau
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm text-white/70 mb-4 line-clamp-2">
      {{ service.description }}
    </p>

    <!-- Features -->
    <div v-if="service.features && service.features.length > 0" class="mb-4">
      <div class="text-xs text-white/50 mb-2">Fonctionnalités :</div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(feature, index) in service.features.slice(0, 3)"
          :key="index"
          class="text-xs bg-white/5 rounded-lg px-2 py-1 text-white/70"
        >
          {{ feature }}
        </div>
        <div
          v-if="service.features.length > 3"
          class="text-xs text-white/40 px-2 py-1"
        >
          +{{ service.features.length - 3 }}
        </div>
      </div>
    </div>

    <!-- Actions & Reactions count -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="text-center p-2 bg-white/5 rounded-lg">
        <div class="text-lg font-bold text-blue-400">{{ service.actionsCount || 0 }}</div>
        <div class="text-xs text-white/60">Actions</div>
      </div>
      <div class="text-center p-2 bg-white/5 rounded-lg">
        <div class="text-lg font-bold text-green-400">{{ service.reactionsCount || 0 }}</div>
        <div class="text-xs text-white/60">Reactions</div>
      </div>
    </div>

    <!-- Connect Button -->
    <button
      @click="$emit('connect', service)"
      :disabled="connecting"
      class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-500/30 rounded-lg text-white hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/25"
    >
      <Icon
        :name="connecting ? 'mdi:loading' : 'mdi:link-variant'"
        :class="connecting ? 'animate-spin' : ''"
        class="w-5 h-5"
      />
      {{ connecting ? 'Connexion...' : 'Connecter' }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
  connecting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['connect']);

// Utilitaires
const getServiceIcon = (serviceName) => {
  const icons = {
    gmail: "mdi:gmail",
    google: "mdi:google",
    facebook: "mdi:facebook",
    github: "mdi:github",
    slack: "mdi:slack",
    discord: "mdi:discord",
    onedrive: "mdi:microsoft-onedrive",
    dropbox: "mdi:dropbox",
    outlook: "mdi:microsoft-outlook",
    instagram: "mdi:instagram",
    youtube: "mdi:youtube",
    spotify: "mdi:spotify",
    reddit: "mdi:reddit",
    timer: "mdi:timer",
    weather: "mdi:weather-cloudy",
    twitter: "mdi:twitter",
    linkedin: "mdi:linkedin",
  };
  return icons[serviceName.toLowerCase()] || "mdi:puzzle-piece";
};

const getServiceIconClass = (serviceName) => {
  const classes = {
    gmail: "bg-red-500/20 text-red-300",
    google: "bg-red-500/20 text-red-300",
    facebook: "bg-blue-500/20 text-blue-300",
    github: "bg-gray-500/20 text-gray-300",
    slack: "bg-purple-500/20 text-purple-300",
    discord: "bg-indigo-500/20 text-indigo-300",
    onedrive: "bg-blue-500/20 text-blue-300",
    dropbox: "bg-blue-500/20 text-blue-300",
    outlook: "bg-blue-500/20 text-blue-300",
    instagram: "bg-pink-500/20 text-pink-300",
    youtube: "bg-red-500/20 text-red-300",
    spotify: "bg-green-500/20 text-green-300",
    reddit: "bg-orange-500/20 text-orange-300",
    timer: "bg-yellow-500/20 text-yellow-300",
    weather: "bg-cyan-500/20 text-cyan-300",
    twitter: "bg-blue-400/20 text-blue-300",
    linkedin: "bg-blue-600/20 text-blue-300",
  };
  return classes[serviceName.toLowerCase()] || "bg-gray-500/20 text-gray-300";
};
</script>
