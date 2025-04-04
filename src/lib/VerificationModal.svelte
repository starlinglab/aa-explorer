<script lang="ts">
	import Modal from './Modal.svelte';
	import type { IndividualAttestation } from './types';
	import { verifyData } from './verification';

	export let showModal: boolean = false;
	export let kind: 'hash' | 'signature' | 'timestamp';
	export let data: IndividualAttestation;
	export let selectedCID: string | null = null;

	let verificationResult: boolean | null = null;
	let isLoading = true;
	let errorMessage: string | null = null;

	$: if (showModal) {
		verifyDetails();
	}

	async function verifyDetails() {
		isLoading = true;
		errorMessage = null;

		try {
			verificationResult = await verifyData(kind, data, selectedCID);
			isLoading = false;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			isLoading = false;
		}
	}

	function getVerificationTitle(): string {
		return `${kind.charAt(0).toUpperCase() + kind.slice(1)} Verification`;
	}

	function getVerificationDetails(): string {
		switch (kind) {
			case 'hash':
				return `Verifying the attestation's hash.`;
			case 'signature':
				return 'Verifying the digital signature using the embedded public key.';
			case 'timestamp':
				return 'Verifying the OpenTimestamps proof against Bitcoin blockchain.';
			default:
				return 'Unknown verification type.';
		}
	}
</script>

<Modal title={getVerificationTitle()} bind:showModal>
	<div class="space-y-4">
		<p class="text-gray-700">{getVerificationDetails()}</p>

		{#if isLoading}
			<div class="flex justify-center">
				<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		{:else if errorMessage}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
				<strong class="font-bold">Error:</strong>
				<span class="block sm:inline"> {errorMessage}</span>
			</div>
		{:else}
			<div
				class={`${verificationResult ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'} px-4 py-3 rounded relative`}
			>
				{#if verificationResult}
					<div class="flex items-center">
						<span class="text-xl mr-2">✅</span>
						<span>Verification successful!</span>
					</div>

					{#if kind === 'hash'}
						<p class="mt-2 text-sm">The attestation CID matches the selected CID.</p>
					{:else if kind === 'signature'}
						<p class="mt-2 text-sm">
							The digital signature is valid and was created with a known public key.
						</p>
					{:else if kind === 'timestamp'}
						<p class="mt-2 text-sm">
							The timestamp proof is valid and anchored in the Bitcoin blockchain.
						</p>
					{/if}
				{:else}
					<div class="flex items-center">
						<span class="text-xl mr-2">❌</span>
						<span>Verification failed!</span>
					</div>

					{#if kind === 'hash'}
						<p class="mt-2 text-sm">The attestation CID does not match the selected CID.</p>
					{:else if kind === 'signature'}
						<p class="mt-2 text-sm">
							The signature could not be verified. This could be due to an invalid signature or an
							unknown public key.
						</p>
					{:else if kind === 'timestamp'}
						<p class="mt-2 text-sm">
							The timestamp proof could not be verified against the Bitcoin blockchain.
						</p>
					{/if}
				{/if}
			</div>
		{/if}

		{#if kind === 'hash' && !isLoading}
			<div class="mt-4 border-t pt-4">
				<h3 class="font-semibold mb-2">Technical Details</h3>
				<div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
					<p>Selected CID: {selectedCID || 'None'}</p>
					<p>Attestation CID: {data.value.attestation.CID.toString()}</p>
				</div>
			</div>
		{:else if kind === 'signature' && !isLoading}
			<div class="mt-4 border-t pt-4">
				<h3 class="font-semibold mb-2">Technical Details</h3>
				<div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
					<p>Public Key: {Array.from(data.value.signature.pubKey).slice(0, 8).join(', ')}...</p>
					<p>Signature: {Array.from(data.value.signature.sig).slice(0, 8).join(', ')}...</p>
				</div>
			</div>
		{:else if kind === 'timestamp' && !isLoading}
			<div class="mt-4 border-t pt-4">
				<h3 class="font-semibold mb-2">Technical Details</h3>
				<div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
					<p>Timestamp Message: {data.value.timestamp.ots.msg.toString()}</p>
					<p>Upgraded: {data.value.timestamp.ots.upgraded ? 'Yes' : 'No'}</p>
				</div>
			</div>
		{/if}
	</div>
</Modal>
