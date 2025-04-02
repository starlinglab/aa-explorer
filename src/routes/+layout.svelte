<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import SettingsButton from '$lib/SettingsButton.svelte';
	import { loadEndpointsFromStorage } from '$lib/index';
	
	let { children } = $props();
	
	onMount(() => {
		// Load saved endpoints on app start
		loadEndpointsFromStorage();
	});
</script>

<SettingsButton />
{@render children()}
