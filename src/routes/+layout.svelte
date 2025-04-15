<script lang="ts">
	import '../app.css';
	import SettingsButton from '$lib/SettingsButton.svelte';
	import VerificationModal from '$lib/VerificationModal.svelte';
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

<div class="navbar sticky top-0 bg-white shadow-md z-50">
	<div class="logo" on:click={resetApp} on:keydown={(e) => e.key === 'Enter' && resetApp()}>
		<img src="/logo.png" alt="AA Explorer Logo" class="logo-img" />
		<span>Authenticated Attributes Explorer</span>
	</div>
	<div class="navbar-right">
		<SettingsButton />
	</div>
</div>

{@render children()}

<div class="modal-container">
	<VerificationModal />
</div>
