<script lang="ts">
	import { onMount } from 'svelte';
	import type { ListOfAttestations } from '../lib/types';
	import TableOfMetadata from '../lib/TableOfMetadata.svelte';
	import { fetchAllCIDs, fetchAllAttestations, shortenCID } from '$lib/index';

	let data: { cids?: Array<string>; error?: string } = {};
	let selectedCID: string | null = null;
	let selectedAttestations: ListOfAttestations = [];
	let selectedError: string | null = null;
	let isLoading: boolean = false;

	onMount(() => {
		const fetchData = async () => {
			try {
				const cids = await fetchAllCIDs();
				data.cids = cids;
			} catch (err: any) {
				data.error = err.message;
			}
		};

		fetchData();

		// Check for selectedCID in URL and load attestations if present
		const urlParams = new URLSearchParams(window.location.search);
		const initialCID = urlParams.get('selectedCID');
		if (initialCID) {
			loadAttestations(initialCID);
		}

		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// When an item is clicked, fetch its attestations.
	async function loadAttestations(cid: string) {
		selectedCID = cid;
		const url = new URL(window.location.href);
		url.searchParams.set('selectedCID', cid);
		window.history.pushState({}, '', url);
		selectedError = null;
		isLoading = true;
		try {
			selectedAttestations = (await fetchAllAttestations(cid)) as ListOfAttestations;
		} catch (err: any) {
			selectedError = err.message;
		} finally {
			isLoading = false;
		}
	}

	// Handle click on whitespace or Esc key to reset selectedCID
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
		'parent'
	];

	$: authenticatedMetadata = selectedAttestations.filter(
		(d) => !KeysOfAuthenticatedRelationships.includes(d['key'])
	);

	$: authenticatedRelationships = selectedAttestations.filter((d) =>
		KeysOfAuthenticatedRelationships.includes(d['key'])
	);
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

	<div class="flex-1 p-4 border-t border-gray-300 overflow-auto">
		<h2 class="text-lg font-bold mb-1">Attestations</h2>
		{#if selectedCID}
			<p class="text-sm text-gray-700 mb-2">For CID: {shortenCID(selectedCID)}</p>
			{#if isLoading}
				<p class="text-sm text-gray-500">Loading attestations...</p>
			{:else if selectedError}
				<p class="text-red-500 text-sm">Error: {selectedError}</p>
			{:else}
				<div class="overflow-x-auto ml-4">
					<h4 class="text-base font-semibold">Authenticated Metadata</h4>
					<TableOfMetadata data={authenticatedMetadata}></TableOfMetadata>
					<h4 class="text-base font-semibold mt-4">Authenticated Relationships</h4>
					<TableOfMetadata data={authenticatedRelationships}></TableOfMetadata>
				</div>
			{/if}
		{:else}
			<p class="text-sm text-gray-500">Click an item to view its attestations.</p>
		{/if}
	</div>
</div>
