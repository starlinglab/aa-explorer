<script lang="ts">
	import type { IndividualAttestation } from './types';
	import { verifyData } from './verification';
	import VerificationModal from './VerificationModal.svelte';

	export let copy;
	export let kind: 'hash' | 'signature' | 'timestamp';
	export let data: IndividualAttestation;
	export let selectedCID: string | null = null;

	let showModal = false;

	async function dataVerifies(): Promise<boolean> {
		return await verifyData(kind, data, selectedCID);
	}

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		showModal = true;
	}
</script>

<VerificationModal
	bind:showModal
	{kind}
	{data}
	{selectedCID}
/>

{#await dataVerifies()}
	Loading...
{:then ok}
	{#if ok}
		<button style="cursor: pointer;" on:click={handleClick} title="{kind}: Verified OK">
			{copy}
		</button>
	{:else}
		<button style="cursor: pointer;" on:click={handleClick} title="{kind}: Verification failed">
			❌
		</button>
	{/if}
{/await}
