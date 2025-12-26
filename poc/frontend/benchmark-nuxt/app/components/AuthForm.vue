<!-- components/AuthForm.vue -->
<template>
    <div class="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
        {{ isRegister ? 'Inscription' : 'Connexion' }}
      </h2>
  
      <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>
  
      <div class="space-y-4">
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          :disabled="loading"
          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="clearError"
        />
  
        <input
          v-model="formData.password"
          type="password"
          placeholder="Mot de passe"
          :disabled="loading"
          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="clearError"
        />
  
        <input
          v-if="isRegister"
          v-model="formData.confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          :disabled="loading"
          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="clearError"
        />
  
        <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
        >
          {{ loading ? 'Chargement...' : (isRegister ? "S'inscrire" : 'Se connecter') }}
        </button>
      </div>
  
      <p class="text-center text-gray-600 mt-6">
        {{ isRegister ? 'Déjà un compte ? ' : 'Pas de compte ? ' }}
        <button
          @click="$emit('toggleMode')"
          :disabled="loading"
          class="text-blue-500 hover:underline"
        >
          {{ isRegister ? 'Se connecter' : "S'inscrire" }}
        </button>
      </p>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { AuthFormData } from '~/types/auth';
  import { validateAuthForm } from '~/utils/validation';
  
  interface Props {
    mode: 'login' | 'register';
  }
  
  const props = defineProps<Props>();
  
  const emit = defineEmits<{
    submit: [data: AuthFormData];
    toggleMode: [];
  }>();
  
  const formData = reactive<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const error = ref<string | null>(null);
  const loading = ref(false);
  
  const isRegister = computed(() => props.mode === 'register');
  
  const clearError = () => {
    if (error.value) error.value = null;
  };
  
  const handleSubmit = async () => {
    error.value = null;
    loading.value = true;
  
    const validationError = validateAuthForm(formData, isRegister.value);
    if (validationError) {
      error.value = validationError;
      loading.value = false;
      return;
    }
  
    try {
      await emit('submit', formData);
    } catch (err) {
      error.value = 'Une erreur est survenue';
    } finally {
      loading.value = false;
    }
  };
  </script>