<script lang="ts">
	import { onMount } from 'svelte';
	import type { Endpoint } from '$lib/index';
	import { fetchAllCIDs, fetchAllAttestations, shortenCID, uint8ArrayToHex } from '$lib/index';

	let data: { cids?: Array<string>; error?: string } = {};
	let selectedCID: string | null = null;
	let selectedAttestations: {
		endpoint: Endpoint;
		attestations: Record<string, any>;
	}[] = [];
	let selectedError: string | null = null;
	let isLoading: boolean = false;

	onMount(async () => {
		try {
			const cids = await fetchAllCIDs();
			data.cids = cids;
		} catch (err: any) {
			data.error = err.message;
		}
	});

	// When an item is clicked, fetch its attestations.
	async function loadAttestations(cid: string) {
		selectedCID = cid;
		selectedAttestations = [];
		selectedError = null;
		isLoading = true;
		try {
			selectedAttestations = await fetchAllAttestations(cid);
		} catch (err: any) {
			selectedError = err.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex flex-col h-screen">
	<div class="flex-1 p-4 overflow-auto">
		{#if data.error}
			<p class="text-red-500">Error: {data.error}</p>
		{:else if !data.cids || data.cids.length === 0}
			<p>Loading...</p>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each data.cids as cid, index (index)}
					<button
						on:click={() => loadAttestations(cid)}
						class="relative z-0 w-30 h-30 bg-gray-200 border border-dashed border-gray-300
      transition-transform duration-200 transform hover:scale-120 hover:bg-gray-300
      hover:border-solid hover:border-gray-800 hover:z-10 hover:cursor-pointer"
						title={cid.toString()}
					>
						{#if cid}
							<div
								class="absolute inset-0 flex items-center justify-center
        text-xs text-gray-700 opacity-0 hover:opacity-100"
							>
								{shortenCID(cid)}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex-1 p-4 border-t border-gray-300 overflow-auto">
		<h2 class="text-lg font-semibold mb-2">Attestations</h2>
		{#if selectedCID}
			<p class="text-sm text-gray-700 mb-2">For CID: {shortenCID(selectedCID)}</p>
			{#if isLoading}
				<p class="text-sm text-gray-500">Loading attestations...</p>
			{:else if selectedError}
				<p class="text-red-500 text-sm">Error: {selectedError}</p>
			{:else if selectedAttestations.length === 0}
				<p class="text-sm text-gray-500">No attestations found.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th
									class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Source</th
								>
								<th
									class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Attribute</th
								>
								<th
									class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Attestation</th
								>
								<th
									class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Signature</th
								>
								<th
									class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Timestamp</th
								>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each selectedAttestations as { endpoint, attestations }}
								{#each Object.entries(attestations) as [attribute, att]}
									<tr>
										<td class="px-4 py-2 text-xs text-gray-700">{endpoint}</td>
										<td class="px-4 py-2 text-xs text-gray-700">{attribute}</td>
										<td class="px-4 py-2 text-xs text-gray-700"
											>{att.attestation?.value ?? 'N/A'}</td
										>
										<td class="px-4 py-2 text-xs text-gray-700"
											>{att.signature
												? shortenCID(uint8ArrayToHex(att.signature.pubKey))
												: 'N/A'}</td
										>
										<td class="px-4 py-2 text-xs text-gray-700"
											>{att.attestation?.timestamp ?? 'N/A'}</td
										>
									</tr>
								{/each}
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{:else}
			<p class="text-sm text-gray-500">Click an item to view its attestations.</p>
		{/if}
	</div>
</div>
