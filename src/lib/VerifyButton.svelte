<script lang="ts">
	import type { IndividualAttestation } from './types';
	import { verifyData, type VerificationResult } from './verification';
	import { showVerificationModal } from './stores';
	import { CheckmarkIcon, QuestionIcon, CrossIcon } from './icons';

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
			<CheckmarkIcon class="w-5 h-5 text-green-500" />
		</button>
	{:else if result.status === 'present'}
		<button
			style="cursor: pointer;"
			on:click={handleClick}
			title="{kind === 'signature' ? 'Signature' : 'Timestamp'} present but doesn't verify"
		>
			<QuestionIcon class="w-5 h-5 text-orange-300" />
		</button>
	{:else}
		<button style="cursor: pointer;" on:click={handleClick} title="{kind}: Verification failed">
			<CrossIcon class="w-5 h-5 text-red-500" />
		</button>
	{/if}
{/await}
