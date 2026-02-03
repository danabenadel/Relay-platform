<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
    <Analytics />
  </div>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'

// Configuration HEAD globale
useHead({
  titleTemplate: "%s - Relay",
  meta: [
    {
      name: "description",
      content: "Plateforme d'automatisation IFTTT/Zapier",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});

// Configuration globale de l'app
provide("appName", "Relay");
</script>