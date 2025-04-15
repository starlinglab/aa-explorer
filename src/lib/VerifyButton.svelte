<script lang="ts">
	import type { IndividualAttestation } from './types';
	import { verifyData, type VerificationResult } from './verification';
	import { showVerificationModal } from './stores';

	export let kind: 'hash' | 'signature' | 'timestamp';
	export let data: IndividualAttestation;
	export let selectedCID: string | null = null;

	async function checkVerification(): Promise<VerificationResult> {
		return await verifyData(kind, data, selectedCID);
	}

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		showVerificationModal(kind, data, selectedCID);
	}
</script>

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
