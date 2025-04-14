<script lang="ts">
	import '../app.css';
	import SettingsButton from '$lib/SettingsButton.svelte';
	// With the new store approach, endpoints are loaded automatically
	// so we don't need to call loadEndpointsFromStorage anymore
	import { endpoints, selectedCID } from '$lib/index';
	
	let { children } = $props();
	
	function resetApp() {
		// Clear the selectedCID in the store
		selectedCID.set(null);
		// Remove the selectedCID from URL
		const url = new URL(window.location.href);
		url.searchParams.delete('selectedCID');
		window.history.pushState({}, '', url);
		// Dispatch popstate event to trigger UI update
		window.dispatchEvent(new Event('popstate'));
	}
</script>

<div class="navbar">
	<div class="logo" on:click={resetApp} on:keydown={(e) => e.key === 'Enter' && resetApp()}>
		<img src="/logo.png" alt="AA Explorer Logo" class="logo-img" />
		<span>AA Explorer</span>
	</div>
	<div class="navbar-right">
		<SettingsButton />
	</div>
</div>
{@render children()}
