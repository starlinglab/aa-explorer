<script lang="ts">
	import type { IndividualAttestation } from './types';

	export let copy;
	export let kind: 'hash' | 'signature' | 'timestamp';
	export let data: IndividualAttestation;

	function dataVerifies() {
		switch (kind) {
			case 'hash':
				// compare data.value.attestation.CID to on-demand computed CID of the attestation
				return data.value.attestation.CID === computeCID(data.value.attestation);
			case 'signature':
				// verify validity of data.value.signature... somehow?
				return verifySignature(data.value.signature);
			case 'timestamp':
				// something timestamp
				return verifyTimestamp(data.value.timestamp);
			default:
				console.log('Unknown kind:', kind);
				return false;
		}
	}

	const computeCID = (attestation) => {
		return 'computedCID';
	};

	const verifySignature = (signature) => {
		return true;
	};

	const verifyTimestamp = (timestamp) => {
		return true;
	};

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		dataVerifies();
	}
</script>

<button style="cursor: pointer;" on:click={handleClick}>
	{#if dataVerifies()}
		{copy}
	{:else}
		❌
	{/if}
</button>
