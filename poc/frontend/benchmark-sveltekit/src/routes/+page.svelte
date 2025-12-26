<!-- src/routes/+page.svelte -->
<script lang="ts">
	import AuthForm from '$lib/components/AuthForm.svelte';
	import type { AuthFormData } from '$lib/types/auth';

	let mode: 'login' | 'register' = 'login';

	async function handleSubmit(event: CustomEvent<AuthFormData>) {
		const data = event.detail;

		// Simulation d'une API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log(`${mode} attempt:`, data);
		alert(`${mode === 'login' ? 'Connexion' : 'Inscription'} simulée avec succès !`);
	}

	function handleToggleMode() {
		mode = mode === 'login' ? 'register' : 'login';
	}
</script>

<svelte:head>
	<title>Benchmark Auth - SvelteKit</title>
	<meta name="description" content="Simple auth form for performance testing" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
	<AuthForm {mode} on:submit={handleSubmit} on:toggleMode={handleToggleMode} />
</main>
