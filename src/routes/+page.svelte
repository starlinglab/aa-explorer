<script lang="ts">
	import { onMount } from 'svelte';
	import type { ListOfAttestations } from '../lib/types';
	import type { Endpoint } from '$lib/index';
	import TableOfMetadata from '../lib/TableOfMetadata.svelte';
	import NetworkChart from '../lib/NetworkChart.svelte';
	import { fetchAllCIDs, fetchAllAttestations, shortenCID, ENDPOINTS, saveEndpointsToStorage } from '$lib/index';

	let data: { cids?: Array<string>; error?: string } = {};
	let selectedCID: string | null = null;
	let selectedAttestations: ListOfAttestations = [];
	let selectedError: string | null = null;
	let isLoading: boolean = false;

	// Function to change the order of endpoints without reloading data
	function reorderEndpoints(primaryEndpoint: Endpoint) {
		const otherEndpoints = ENDPOINTS.filter((endpoint) => endpoint !== primaryEndpoint);
		ENDPOINTS.length = 0;
		ENDPOINTS.push(primaryEndpoint, ...otherEndpoints);
		
		// Save the updated endpoints order to localStorage
		saveEndpointsToStorage();

		// Update the isPrimarySource flag for each attestation instead of reloading
		if (selectedAttestations.length > 0) {
			// trigger reactivity
			const updatedAttestations = selectedAttestations.map((att) => ({
				...att,
				isPrimarySource: att.sourceEndpoint === primaryEndpoint
			}));

			// Reassign to trigger Svelte reactivity
			selectedAttestations = updatedAttestations;
		}
	}

	async function fetchData() {
		try {
			const cids = await fetchAllCIDs();
			data.cids = cids;
		} catch (err: any) {
			data.error = err.message;
		}
	}

	function checkSelectedCID() {
		const urlParams = new URLSearchParams(window.location.search);
		const initialCID = urlParams.get('selectedCID');
		if (initialCID && initialCID !== selectedCID) {
			loadAttestations(initialCID);
		}
	}

	onMount(() => {
		fetchData();
		checkSelectedCID();

		window.addEventListener('popstate', checkSelectedCID);
		document.addEventListener('keydown', handleKeyDown);
		// document.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('popstate', checkSelectedCID);
			document.removeEventListener('keydown', handleKeyDown);
			// document.removeEventListener('click', handleClickOutside);
		};
	});

	// When an item is clicked, fetch its attestations.
	async function loadAttestations(cid: string) {
		selectedCID = cid;
		const url = new URL(window.location.href);
		url.searchParams.set('selectedCID', cid);
		window.history.pushState({}, '', url);
		window.dispatchEvent(new Event('popstate')); // Manually trigger popstate event
		selectedError = null;
		isLoading = true;
		try {
			const attestations = await fetchAllAttestations(cid);
			selectedAttestations = attestations as ListOfAttestations;
		} catch (err: any) {
			selectedError = err.message;
			console.error(`Error fetching attestations: ${err.message}`);
		} finally {
			isLoading = false;
		}
	}

	// Handle click on whitespace or Esc key to reset selectedCID
	// NOTE: not used to permit clicking around and navigating to new CIDs
	function handleClickOutside(event: MouseEvent) {
		if (!(event.target as HTMLElement).closest('.cid-item')) {
			selectedCID = null;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			selectedCID = null;
		}
	}

	const KeysOfAuthenticatedRelationships = [
		'asset_subcollection',
		'asset_collection',
		'children',
		'parents'
	];

	$: authenticatedMetadata = selectedAttestations.filter(
		(d) => !KeysOfAuthenticatedRelationships.includes(d['key'])
	);

	$: authenticatedRelationships = selectedAttestations.filter((d) =>
		KeysOfAuthenticatedRelationships.includes(d['key'])
	);
</script>

<div class="flex h-screen">
	<div class="flex-2/3 p-4 overflow-auto">
		{#if data.error}
			<p class="text-red-500">Error: {data.error}</p>
		{:else if !data.cids || data.cids.length === 0}
			<p>Loading...</p>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each data.cids as cid, index (index)}
					<button
						on:click={() => loadAttestations(cid)}
						on:keydown={(event) => event.key === 'Enter' && loadAttestations(cid)}
						class="cid-item relative z-0 w-30 h-30 bg-gray-200 border border-dashed border-gray-300
        transition-transform duration-200 transform {selectedCID === cid
							? 'scale-140 bg-gray-300 border-solid border-gray-800 z-10'
							: 'hover:scale-120 hover:bg-gray-300 hover:border-solid hover:border-gray-800 hover:z-10 hover:cursor-pointer'}"
						title={cid.toString()}
						aria-pressed={selectedCID === cid}
					>
						<!-- <img src={`https://files.dev.starlinglab.org/${cid}`} alt="" /> -->
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

	<div class="flex-1/3 p-3 border-l border-gray-300">
		{#if selectedCID}
			<div class="flex">
				<div class="w-full p-1">
					<img src={`https://files.dev.starlinglab.org/${selectedCID}`} alt="" class="max-w-full" />
				</div>
			</div>
		{/if}
		<h2 class="text-lg font-bold mb-1">Attestations</h2>
		{#if selectedCID}
			<p class="text-sm text-gray-700 mb-2">For CID: {shortenCID(selectedCID)}</p>

			<!-- Data Source Selection with dynamic buttons -->
			<div class="mb-3 flex flex-wrap gap-2">
				<span class="text-sm text-gray-700">Primary Source:</span>
				{#each ENDPOINTS as endpoint}
					<button
						class={`text-xs px-2 py-1 rounded ${ENDPOINTS[0] === endpoint ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
						on:click={() => reorderEndpoints(endpoint)}
					>
						{endpoint.replace(/^https:\/\//, '').replace(/\.aa\.prod\.starlinglab\.org$/, '').replace(/\..*$/, '')}
					</button>
				{/each}
			</div>

			{#if isLoading}
				<p class="text-sm text-gray-500">Loading attestations...</p>
			{:else if selectedError}
				<p class="text-red-500 text-sm">Error: {selectedError}</p>
			{:else}
				<div class="overflow-x-auto ml-4">
					<h4 class="text-base font-semibold">Authenticated Metadata</h4>
					<TableOfMetadata data={authenticatedMetadata} {selectedCID}></TableOfMetadata>
					<h4 class="text-base font-semibold mt-4">Authenticated Relationships</h4>
					<TableOfMetadata data={authenticatedRelationships} {selectedCID}></TableOfMetadata>

					<!-- Network chart under the tables -->
					<h4 class="text-base font-semibold mt-4">Relationship Network</h4>
					<div class="w-full">
						<NetworkChart {authenticatedRelationships} />
					</div>
				</div>
			{/if}
		{:else}
			<p class="text-sm text-gray-500">Click an item to view its attestations.</p>
		{/if}
	</div>
</div>