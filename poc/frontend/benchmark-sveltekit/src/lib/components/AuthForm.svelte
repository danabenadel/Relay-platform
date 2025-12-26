<!-- src/lib/components/AuthForm.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AuthFormData } from '$lib/types/auth';
  import { validateAuthForm } from '$lib/utils/validation';

  export let mode: 'login' | 'register';

  const dispatch = createEventDispatcher<{
    submit: AuthFormData;
    toggleMode: void;
  }>();

  let formData: AuthFormData = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  let error: string | null = null;
  let loading = false;

  $: isRegister = mode === 'register';

  function clearError() {
    if (error) error = null;
  }

  async function handleSubmit() {
    error = null;
    loading = true;

    const validationError = validateAuthForm(formData, isRegister);
    if (validationError) {
      error = validationError;
      loading = false;
      return;
    }

    try {
      dispatch('submit', formData);
    } catch (err) {
      error = 'Une erreur est survenue';
    } finally {
      loading = false;
    }
  }

  function handleToggleMode() {
    dispatch('toggleMode');
  }
</script>

<div class="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
  <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
    {isRegister ? 'Inscription' : 'Connexion'}
  </h2>

  {#if error}
    <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {error}
    </div>
  {/if}

  <div class="space-y-4">
    <input
      bind:value={formData.email}
      type="email"
      placeholder="Email"
      disabled={loading}
      class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      on:input={clearError}
    />

    <input
      bind:value={formData.password}
      type="password"
      placeholder="Mot de passe"
      disabled={loading}
      class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      on:input={clearError}
    />

    {#if isRegister}
      <input
        bind:value={formData.confirmPassword}
        type="password"
        placeholder="Confirmer le mot de passe"
        disabled={loading}
        class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        on:input={clearError}
      />
    {/if}

    <button
      on:click={handleSubmit}
      disabled={loading}
      class="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
    >
      {loading ? 'Chargement...' : (isRegister ? "S'inscrire" : 'Se connecter')}
    </button>
  </div>

  <p class="text-center text-gray-600 mt-6">
    {isRegister ? 'Déjà un compte ? ' : 'Pas de compte ? '}
    <button
      on:click={handleToggleMode}
      disabled={loading}
      class="text-blue-500 hover:underline"
    >
      {isRegister ? 'Se connecter' : "S'inscrire"}
    </button>
  </p>
</div>