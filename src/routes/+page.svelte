<script lang="ts">
	import { onMount } from 'svelte';
	import type { ListOfAttestations } from '../lib/types';
	import type { EndpointConfig } from '$lib/index';
	import TableOfMetadata from '../lib/TableOfMetadata.svelte';
	import NetworkChart from '../lib/NetworkChart.svelte';
	import {
		fetchAllCIDs,
		fetchAllAttestations,
		shortenCID,
		endpoints,
		selectedCID as storeCID
	} from '$lib/index';

	let data: { cids?: Array<string>; error?: string } = {};
	let selectedCID: string | null = null;
	let selectedAttestations: ListOfAttestations = [];
	let selectedError: string | null = null;
	let isLoading: boolean = false;

	// Store current endpoints state
	let currentEndpoints: EndpointConfig[] = [];

	// Subscribe to the endpoints store
	const unsubscribeEndpoints = endpoints.subscribe((value) => {
		currentEndpoints = value;

		// Update the isPrimarySource flag for attestations when endpoints change
		if (selectedAttestations.length > 0 && value.length > 0) {
			// Get the primary endpoint URL
			const primaryEndpointUrl = value[0].url;

			// Update attestations with the new primary source
			selectedAttestations = selectedAttestations.map((att) => ({
				...att,
				isPrimarySource: att.sourceEndpoint === primaryEndpointUrl
			}));
		}
	});

	// Subscribe to the selectedCID store
	const unsubscribeSelectedCID = storeCID.subscribe((value) => {
		if (value !== selectedCID) {
			if (value === null) {
				// Clear the selected CID and attestations
				selectedCID = null;
				selectedAttestations = [];
				selectedError = null;
			} else if (value) {
				// Load attestations for the new CID
				loadAttestations(value);
			}
		}
	});

	// Clean up subscription when component is destroyed
	onMount(() => {
		fetchData();
		checkSelectedCID();

		window.addEventListener('popstate', checkSelectedCID);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			unsubscribeEndpoints();
			unsubscribeSelectedCID();
			window.removeEventListener('popstate', checkSelectedCID);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Function to change the order of endpoints without reloading data
	function reorderEndpoints(primaryEndpoint: EndpointConfig) {
		const otherEndpoints = currentEndpoints.filter(
			(endpoint) => endpoint.url !== primaryEndpoint.url
		);
		const reorderedEndpoints = [primaryEndpoint, ...otherEndpoints];

		// Update the store
		endpoints.set(reorderedEndpoints);
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
		} else if (!initialCID && selectedCID !== null) {
			// URL has no selectedCID, reset the view
			selectedCID = null;
			selectedAttestations = [];
			selectedError = null;
			// Also update the store
			storeCID.set(null);
		}
	}

	// When an item is clicked, fetch its attestations.
	async function loadAttestations(cid: string) {
		selectedCID = cid;
		// Update the store
		storeCID.set(cid);
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

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			selectedCID = null;
			// Update the store
			storeCID.set(null);
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
	<div class="flex-grow p-4 overflow-auto">
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
						<img src={`https://files.dev.starlinglab.org/${cid}`} alt="" />
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

	<div class="w-160 p-3 border-l border-gray-300">
		{#if selectedCID}
			<div class="flex">
				<div class="w-full p-1">
					<img
						src={`https://files.dev.starlinglab.org/${selectedCID}`}
						alt=""
						class="h-80 object-contain mx-auto"
					/>
				</div>
			</div>
		{/if}
		<h2 class="text-lg font-bold mb-1">Attestations</h2>
		{#if selectedCID}
			<p class="text-sm text-gray-700 mb-2">For CID: {shortenCID(selectedCID)}</p>

			<div class="mb-3 flex flex-wrap gap-2">
				<span class="text-sm text-gray-700">Primary Source:</span>
				{#each currentEndpoints as endpoint}
					<button
						class={`text-xs px-2 py-1 rounded ${currentEndpoints[0]?.url === endpoint.url ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
						on:click={() => reorderEndpoints(endpoint)}
					>
						{endpoint.name}
					</button>
				{/each}
			</div>

			{#if isLoading}
				<div class="w-320">
					<p class="text-sm text-gray-500">Loading attestations...</p>
				</div>
			{:else if selectedError}
				<p class="text-red-500 text-sm">Error: {selectedError}</p>
			{:else}
				<div class="w-full overflow-x-auto ml-4">
					<h4 class="text-base font-semibold">Authenticated Metadata</h4>
					<TableOfMetadata data={authenticatedMetadata} {selectedCID}></TableOfMetadata>

					<h4 class="text-base font-semibold mt-4">Authenticated Relationships</h4>
					{#if authenticatedRelationships.length > 0}
						<TableOfMetadata data={authenticatedRelationships} {selectedCID}></TableOfMetadata>

						<h4 class="text-base font-semibold mt-4">Relationship Network</h4>
						<div class="w-full">
							<NetworkChart {authenticatedRelationships} />
						</div>
					{:else}
						<p class="text-sm text-gray-500 ml-2 mb-4">No relationships found for this asset.</p>
					{/if}
				</div>
			{/if}
		{:else}
			<div class="w-160">
				<p class="text-sm text-gray-500">Click an item to view its attestations.</p>
			</div>
		{/if}
	</div>
</div>
