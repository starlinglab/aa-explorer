<script lang="ts">
	import { onMount } from 'svelte';
	import type { ListOfAttestations } from '../lib/types';
	import type { EndpointConfig } from '$lib/index';
	import TableOfMetadata from '../lib/TableOfMetadata.svelte';
	import NetworkChart from '../lib/NetworkChart.svelte';
	import {
		fetchAllCIDs,
		fetchAllAttestations,
		fetchCIDMetadata,
		shortenCID,
		endpoints,
		selectedCID as storeCID,
		CopyButton
	} from '$lib/index';
	import type { CIDEntry } from '$lib/index';
	import { DownloadIcon } from '$lib/icons';

	// Track whether the image loaded successfully
	let imageLoaded = true;

	let data: { cids?: Array<CIDEntry>; error?: string } = {};
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
			loadCIDMetadata(cids);
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
		// Reset image loading state when selecting a new CID
		imageLoaded = true;
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

	// Handle image loading errors
	function handleImageError() {
		imageLoaded = false;
	}

	function handleImageLoad() {
		imageLoaded = true;
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

	$: selectedCIDFilesBaseUrl = data.cids?.find((d) => d.cid === selectedCID)?.filesBaseUrl ?? '';

	// filters — populated by background fetches after CIDs load
	let cidToProjectId: Map<string, string> = new Map();
	let cidToRelationshipCount: Map<string, number> = new Map();
	let cidImages: Set<string> = new Set();
	let metadataLoading = false;
	let selectedProjects: Set<string> = new Set();
	let filterRelationships = false;
	let filterImages = false;

	async function loadCIDMetadata(cids: CIDEntry[]) {
		const primaryEndpoint = currentEndpoints[0];
		if (!primaryEndpoint) return;
		metadataLoading = true;
		const results = await Promise.all(
			cids.map(async ({ cid }) => {
				const meta = await fetchCIDMetadata(primaryEndpoint, cid);
				return { cid, ...meta };
			})
		);
		const projectMap = new Map<string, string>();
		const relMap = new Map<string, number>();
		const imgSet = new Set<string>();
		for (const { cid, projectId, relationshipCount, isImage } of results) {
			if (projectId) projectMap.set(cid, projectId);
			if (relationshipCount > 0) relMap.set(cid, relationshipCount);
			if (isImage) imgSet.add(cid);
		}
		cidToProjectId = projectMap;
		cidToRelationshipCount = relMap;
		cidImages = imgSet;
		// "main" (no project_id) starts unchecked
		selectedProjects = new Set(projectMap.values());
		metadataLoading = false;
	}

	$: projectCounts = (data.cids ?? []).reduce(
		(acc, { cid }) => {
			const id = cidToProjectId.get(cid) ?? 'main';
			acc[id] = (acc[id] ?? 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	function toggleProject(name: string) {
		if (selectedProjects.has(name)) {
			selectedProjects.delete(name);
		} else {
			selectedProjects.add(name);
		}
		selectedProjects = selectedProjects;
	}

	$: filteredCIDs = (data.cids ?? []).filter(({ cid }) => {
		const projectId = cidToProjectId.get(cid) ?? 'main';
		if (!selectedProjects.has(projectId)) return false;
		if (filterRelationships && !cidToRelationshipCount.has(cid)) return false;
		if (filterImages && !cidImages.has(cid)) return false;
		return true;
	});
</script>

<!-- Main container with fixed height (accounts for navbar) -->
<div class="flex overflow-hidden" style="height: calc(100vh - 80px)">

	<!-- Filter sidebar -->
	<div class="flex-shrink-0 w-48 border-r border-gray-200 bg-white overflow-auto flex flex-col">
		<p class="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</p>
		{#if metadataLoading}
			<span class="px-3 py-2 text-xs text-gray-400">Loading…</span>
		{:else}
			{#each Object.entries(projectCounts) as [name, count]}
				<label class="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 select-none">
					<input
						type="checkbox"
						checked={selectedProjects.has(name)}
						on:change={() => toggleProject(name)}
						class="accent-blue-500"
					/>
					<span class="flex-1 truncate">{name}</span>
					<span class="text-xs text-gray-400">{count}</span>
				</label>
			{/each}
		{/if}

		<p class="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Relationships</p>
		<div class="px-3 py-1.5">
			<button
				on:click={() => (filterRelationships = !filterRelationships)}
				class="w-full text-left text-sm px-2 py-1 rounded transition-colors {filterRelationships
					? 'bg-blue-500 text-white'
					: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
			>
				🔗 Related only
				<span class="float-right text-xs {filterRelationships ? 'text-blue-100' : 'text-gray-400'}">{cidToRelationshipCount.size}</span>
			</button>
		</div>

		<p class="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Media type</p>
		<div class="px-3 py-1.5">
			<button
				on:click={() => (filterImages = !filterImages)}
				class="w-full text-left text-sm px-2 py-1 rounded transition-colors {filterImages
					? 'bg-blue-500 text-white'
					: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
			>
				🖼️ Images only
				<span class="float-right text-xs {filterImages ? 'text-blue-100' : 'text-gray-400'}">{cidImages.size}</span>
			</button>
		</div>
	</div>

	<!-- Panels -->
	<div class="flex flex-1 overflow-hidden">
	<!-- Left panel - Assets grid (independently scrollable) -->
	<div class="w-1/2 overflow-auto p-4 {selectedCID ? 'lg:w-2/3' : 'flex-grow'}">
		{#if data.error}
			<p class="text-red-500">Error: {data.error}</p>
		{:else if !data.cids || data.cids.length === 0}
			<p>Loading...</p>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each filteredCIDs as { cid, filesBaseUrl }, index (index)}
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
						<img src={`${filesBaseUrl}/thumbs/${cid}`} alt="" />
						{#if cid}
							<div
								class="absolute inset-0 flex items-center justify-center
								text-xs text-gray-700 opacity-0 hover:opacity-100"
							>
								{shortenCID(cid)}
							</div>
						{/if}
						{#if cidToRelationshipCount.has(cid)}
							<div class="absolute bottom-0.5 right-0.5 text-xs leading-none bg-black/60 text-white rounded px-1 py-0.5 pointer-events-none">
								🔗 {cidToRelationshipCount.get(cid)}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Right panel - Details (independently scrollable) -->
	<div
		class="{selectedCID
			? 'w-1/2 lg:w-1/3'
			: 'w-0'} border-l border-gray-300 overflow-auto transition-all duration-300 ease-in-out"
	>
		<div class="p-3 {!selectedCID ? 'hidden' : ''}">
			{#if selectedCID}
				<div class="flex">
					<div class="w-full p-1">
						<img
							src={`${selectedCIDFilesBaseUrl}/thumbs/${selectedCID}`}
							alt=""
							class="h-80 object-contain mx-auto"
							on:error={handleImageError}
							on:load={handleImageLoad}
						/>
						{#if imageLoaded}
							<p class="text-xs text-gray-500 mt-1">This is an optimised preview of the asset.</p>
						{:else}
							<p class="text-xs text-gray-500 mt-1">No preview available for this asset.</p>
						{/if}
						<p class="text-xs text-gray-500 mb-2">
							Hash: <code>{shortenCID(selectedCID)}</code>
							<CopyButton
								textToCopy={selectedCID}
								label="Copy CID to clipboard"
								displayStyle="icon"
							/> |
							<a
								href={`${selectedCIDFilesBaseUrl}/og/${selectedCID}`}
								download
								class="text-blue-500 hover:underline inline-flex align-text-bottom"
								title="Download original file"
							>
								<span class="inline-flex gap-1">
									<DownloadIcon class="w-4 h-4" />
									<span>Download original file</span>
								</span>
							</a>
						</p>
					</div>
				</div>
				<hr class="gray-200 mt-2 mb-2" />
				{#if isLoading}
					<div class="w-full">
						<p class="text-sm text-gray-500">Loading attestations...</p>
					</div>
				{:else if selectedError}
					<p class="text-red-500 text-sm">Error: {selectedError}</p>
				{:else}
					<div class="w-full overflow-x-auto">
						<h3 class="text-base font-semibold">Authenticated Metadata</h3>
						<p class="text-sm text-gray-700">
							The following metadata might come from the following sources, and in this order.<br />
							Click on a source to select it as primary. Head to the Settings menu to add sources.
						</p>
						<div class="mb-3 flex flex-wrap gap-2">
							{#each currentEndpoints as endpoint}
								<button
									class={`text-xs px-2 py-1 rounded ${currentEndpoints[0]?.url === endpoint.url ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
									on:click={() => reorderEndpoints(endpoint)}
								>
									{endpoint.name}
								</button>
							{/each}
						</div>
						<p class="text-xs text-gray-500">Legend: (H)ash, (S)ignature, (T)imestamp</p>
						<TableOfMetadata data={authenticatedMetadata} {selectedCID}></TableOfMetadata>

						<h4 class="text-base font-semibold mt-4">Authenticated Relationships</h4>
						{#if authenticatedRelationships.length > 0}
							<TableOfMetadata data={authenticatedRelationships} {selectedCID}></TableOfMetadata>

							<h4 class="text-base font-semibold mt-4">Relationship Network</h4>
							<div class="w-full">
								<NetworkChart {authenticatedRelationships} />
							</div>
						{:else}
							<p class="text-sm text-gray-500 mb-4">No relationships found for this asset.</p>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
</div>
