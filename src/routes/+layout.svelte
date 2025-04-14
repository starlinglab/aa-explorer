<script lang="ts">
	import '../app.css';
	import SettingsButton from '$lib/SettingsButton.svelte';
	// With the new store approach, endpoints are loaded automatically
	// so we don't need to call loadEndpointsFromStorage anymore
	import { endpoints } from '$lib/index';
	
	let { children } = $props();
</script>

<div class="navbar">
	<div class="logo">
		<img src="/logo.png" alt="AA Explorer Logo" class="logo-img" />
		<span>AA Explorer</span>
	</div>
	<div class="navbar-right">
		<SettingsButton />
	</div>
</div>
{@render children()}
