<script lang="ts">
	import Modal from './Modal.svelte';
	import { verifyData, type VerificationResult } from './verification';
	import { verificationModalStore, hideVerificationModal } from './stores';

	// Local reactive variables
	let verificationResult: VerificationResult | null = null;
	let isLoading = true;
	let errorMessage: string | null = null;

	// Subscribe to the store
	$: modalData = $verificationModalStore;
	$: showModal = modalData.show;
	$: kind = modalData.kind;
	$: data = modalData.data;
	$: selectedCID = modalData.selectedCID;

	// When modal data changes and is visible, verify the data
	$: if (showModal && data) {
		verifyDetails();
	}

	async function verifyDetails() {
		isLoading = true;
		errorMessage = null;

		try {
			verificationResult = await verifyData(kind, data!, selectedCID);
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

	function handleModalClose() {
		hideVerificationModal();
	}
</script>

{#if showModal && data}
	<Modal title={getVerificationTitle()} {showModal} on:close={handleModalClose}>
		<div class="space-y-4">
			<p class="text-gray-700">{getVerificationDetails()}</p>

			{#if isLoading}
				<div class="flex justify-center">
					<div
						class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
					></div>
				</div>
			{:else if errorMessage}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
					<strong class="font-bold">Error:</strong>
					<span class="block sm:inline"> {errorMessage}</span>
				</div>
			{:else if verificationResult}
				<div
					class={`${
						verificationResult.status === 'verified'
							? 'bg-green-100 border border-green-400 text-green-700'
							: verificationResult.status === 'present'
								? 'bg-orange-100 border border-orange-400 text-orange-700'
								: 'bg-red-100 border border-red-400 text-red-700'
					} px-4 py-3 rounded relative`}
				>
					{#if verificationResult.status === 'verified'}
						<div class="flex items-center">
							<span class="text-xl mr-2">🟢</span>
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
					{:else if verificationResult.status === 'present'}
						<div class="flex items-center">
							<span class="text-xl mr-2">🟠</span>
							<span
								>{kind === 'signature' ? 'Signature' : 'Timestamp'} present but doesn't verify!</span
							>
						</div>

						{#if kind === 'signature'}
							<p class="mt-2 text-sm">
								The signature exists but could not be verified. This could be due to:
							</p>
							<ul class="list-disc pl-5 mt-1">
								<li>The signature was created with an unknown public key</li>
								<li>The signature is invalid or has been tampered with</li>
								<li>The data was modified after signing</li>
							</ul>
						{:else if kind === 'timestamp'}
							<p class="mt-2 text-sm">
								The timestamp exists but could not be verified. This could be due to:
							</p>
							<ul class="list-disc pl-5 mt-1">
								<li>The timestamp proof isn't properly formatted</li>
								<li>The timestamp hasn't been anchored in the blockchain yet</li>
								<li>The data was modified after timestamping</li>
							</ul>
						{/if}
					{:else}
						<div class="flex items-center">
							<span class="text-xl mr-2">🔴</span>
							<span>Verification failed!</span>
						</div>

						{#if kind === 'hash'}
							<p class="mt-2 text-sm">The attestation CID does not match the selected CID.</p>
						{:else if kind === 'signature'}
							<p class="mt-2 text-sm">No signature was found for this attestation.</p>
						{:else if kind === 'timestamp'}
							<p class="mt-2 text-sm">No timestamp was found for this attestation.</p>
						{/if}
					{/if}
				</div>
			{/if}

			{#if kind === 'hash' && !isLoading && data}
				<div class="mt-4 border-t pt-4">
					<h3 class="font-semibold mb-2">Technical Details</h3>
					<div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
						<p>Selected CID: {selectedCID || 'None'}</p>
						<p>Attestation CID: {data.value.attestation.CID.toString()}</p>
					</div>
				</div>
			{:else if kind === 'signature' && !isLoading && data}
				<div class="mt-4 border-t pt-4">
					<h3 class="font-semibold mb-2">Technical Details</h3>
					<div class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
						<p>Public Key: {Array.from(data.value.signature.pubKey).slice(0, 8).join(', ')}...</p>
						<p>Signature: {Array.from(data.value.signature.sig).slice(0, 8).join(', ')}...</p>
					</div>
				</div>
			{:else if kind === 'timestamp' && !isLoading && data}
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
{/if}
