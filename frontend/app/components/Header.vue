<template>
  <header
    class="border-b border-gray-200 bg-white/75 backdrop-blur-sm sticky top-0 z-50"
  >
    <UContainer>
      <nav class="flex justify-between items-center py-4">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center space-x-2 text-xl font-bold text-primary"
        >
          <UIcon name="i-heroicons-bolt" />
          <span>Relay</span>
        </NuxtLink>

        <!-- Navigation principale -->
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="hover:text-primary transition-colors"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/services"
            class="hover:text-primary transition-colors"
          >
            Services
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/areas"
            class="hover:text-primary transition-colors"
          >
            AREAs
          </NuxtLink>
        </div>

        <!-- Actions utilisateur -->
        <div class="flex items-center gap-2">
          <template v-if="isAuthenticated">
            <!-- Avatar + menu dropdown -->
            <UDropdown :items="userMenuItems">
              <UButton
                variant="ghost"
                :label="user?.name || 'Utilisateur'"
                trailing-icon="i-heroicons-chevron-down-20-solid"
              />
            </UDropdown>
          </template>
          <template v-else>
            <UButton to="/login" color="primary"> Connexion </UButton>
          </template>
        </div>

        <!-- Menu mobile -->
        <UButton
          v-if="isAuthenticated"
          class="md:hidden"
          variant="ghost"
          icon="i-heroicons-bars-3"
          @click="toggleMobileMenu"
        />
      </nav>

      <!-- Navigation mobile -->
      <div v-if="showMobileMenu" class="md:hidden py-4 border-t">
        <div class="space-y-2">
          <NuxtLink
            to="/dashboard"
            class="block py-2 px-4 rounded hover:bg-gray-100"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/services"
            class="block py-2 px-4 rounded hover:bg-gray-100"
          >
            Services
          </NuxtLink>
          <NuxtLink
            to="/areas"
            class="block py-2 px-4 rounded hover:bg-gray-100"
          >
            AREAs
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth();
const showMobileMenu = ref(false);

const userMenuItems = [
  [
    {
      label: "Profil",
      icon: "i-heroicons-user",
      to: "/profile",
    },
  ],
  [
    {
      label: "Déconnexion",
      icon: "i-heroicons-arrow-right-on-rectangle",
      click: logout,
    },
  ],
];

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

// Fermer le menu mobile lors du changement de route
watch(
  () => useRoute().path,
  () => {
    showMobileMenu.value = false;
  }
);
</script>
