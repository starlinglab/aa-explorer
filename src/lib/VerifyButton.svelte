<script lang="ts">
	import type { IndividualAttestation } from './types';
	import { verifyData, type VerificationResult } from './verification';
	import VerificationModal from './VerificationModal.svelte';

	export let kind: 'hash' | 'signature' | 'timestamp';
	export let data: IndividualAttestation;
	export let selectedCID: string | null = null;

	let showModal = false;

	async function checkVerification(): Promise<VerificationResult> {
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

{#await checkVerification()}
	Loading...
{:then result}
	{#if result.status === 'verified'}
		<button style="cursor: pointer;" on:click={handleClick} title="{kind}: Verified OK">
			🟢
		</button>
	{:else if result.status === 'present'}
		<button style="cursor: pointer;" on:click={handleClick} title="{kind === 'signature' ? 'Signature' : 'Timestamp'} present but doesn't verify">
			🟠
		</button>
	{:else}
		<button style="cursor: pointer;" on:click={handleClick} title="{kind}: Verification failed">
			🔴
		</button>
	{/if}
{/await}
