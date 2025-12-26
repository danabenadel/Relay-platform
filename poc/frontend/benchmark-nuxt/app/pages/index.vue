<template>
    <main class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AuthForm 
        :mode="mode"
        @submit="handleSubmit"
        @toggle-mode="handleToggleMode"
      />
    </main>
  </template>
  
  <script setup lang="ts">
  import type { AuthFormData } from '~/types/auth';
  
  // Meta pour la page
  useHead({
    title: 'Benchmark Auth - Nuxt',
    meta: [
      { name: 'description', content: 'Simple auth form for performance testing' }
    ]
  });
  
  const mode = ref<'login' | 'register'>('login');
  
  const handleSubmit = async (data: AuthFormData) => {
    // Simulation d'une API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`${mode.value} attempt:`, data);
    alert(`${mode.value === 'login' ? 'Connexion' : 'Inscription'} simulée avec succès !`);
  };
  
  const handleToggleMode = () => {
    mode.value = mode.value === 'login' ? 'register' : 'login';
  };
  </script>