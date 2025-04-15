<script lang="ts">
	import { onMount } from 'svelte';
	import SettingsModal from './SettingsModal.svelte';
	import { SettingsIcon } from './icons';
	
	let showSettingsModal = false;
	
	function toggleSettingsModal() {
		showSettingsModal = !showSettingsModal;
	}
</script>

<div class="settings-button">
	<button 
		class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
		on:click={toggleSettingsModal}
		title="Settings"
	>
		<SettingsIcon class="h-6 w-6" />
	</button>
	
	<SettingsModal bind:showModal={showSettingsModal} />
</div>

<style>
	.settings-button {
		z-index: 40;
	}
</style>