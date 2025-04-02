<script lang="ts">
	import '../app.css';
	import SettingsButton from '$lib/SettingsButton.svelte';
	// With the new store approach, endpoints are loaded automatically
	// so we don't need to call loadEndpointsFromStorage anymore
	import { endpoints } from '$lib/index';
	
	let { children } = $props();
</script>

<SettingsButton />
{@render children()}
