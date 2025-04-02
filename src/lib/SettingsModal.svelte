<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import { ENDPOINTS, type Endpoint, saveEndpointsToStorage } from './index';

	export let showModal = false;

	let endpointsList: { url: Endpoint; id: string }[] = [];

	// Initialize the endpoints list on component mount
	onMount(() => {
		refreshEndpointsList();
	});

	function refreshEndpointsList() {
		endpointsList = ENDPOINTS.map((url, index) => ({
			url,
			id: `endpoint-${index}`
		}));
	}

	// Update the global ENDPOINTS array when the user saves changes
	function saveChanges() {
		// Clear the current endpoints array
		ENDPOINTS.length = 0;

		// Add the reordered endpoints
		endpointsList.forEach((item) => {
			ENDPOINTS.push(item.url);
		});

		// Save to localStorage
		saveEndpointsToStorage();

		// Close the modal
		showModal = false;
	}

	// Add a new endpoint
	function addEndpoint() {
		const newEndpoint = 'https://' as Endpoint;
		endpointsList = [
			...endpointsList,
			{ url: newEndpoint, id: `endpoint-${endpointsList.length}` }
		];
	}

	// Remove an endpoint
	function removeEndpoint(index: number) {
		endpointsList = endpointsList.filter((_, i) => i !== index);
	}

	// Handle endpoint URL changes
	function handleEndpointChange(index: number, newValue: string) {
		const updatedList = [...endpointsList];
		updatedList[index].url = newValue as Endpoint;
		endpointsList = updatedList;
	}

	// Drag and drop functionality
	let draggedItem: number | undefined;

	function handleDragStart(index: number) {
		draggedItem = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(index: number) {
		if (draggedItem === undefined) return;

		const newList = [...endpointsList];
		const [removed] = newList.splice(draggedItem, 1);
		newList.splice(index, 0, removed);

		endpointsList = newList;
		draggedItem = undefined;
	}
</script>

<Modal {showModal} title="Endpoint Settings">
	<div class="mb-4">
		<p class="text-sm text-gray-600 mb-2">
			Configure and reorder the endpoints. The first endpoint will be considered the primary source.
		</p>

		<div class="endpoints-list space-y-2">
			{#each endpointsList as endpoint, index}
				<div
					class="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
					draggable="true"
					on:dragstart={() => handleDragStart(index)}
					on:dragover={handleDragOver}
					on:drop={() => handleDrop(index)}
				>
					<div class="cursor-move p-1">☰</div>
					<input
						type="text"
						class="flex-grow p-2 border border-gray-300 rounded"
						value={endpoint.url}
						on:input={(e) => handleEndpointChange(index, e.currentTarget.value)}
					/>
					{#if endpointsList.length > 1}
						<button
							class="p-1 text-red-500 hover:text-red-700"
							on:click={() => removeEndpoint(index)}
							title="Remove endpoint"
						>
							✕
						</button>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-4 flex justify-between">
			<button
				class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
				on:click={addEndpoint}
			>
				+ Add Endpoint
			</button>

			<button
				class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				on:click={saveChanges}
			>
				Save Changes
			</button>
		</div>
	</div>
</Modal>

<style>
	.endpoints-list > div:hover {
		background-color: #f0f9ff;
	}

	.cursor-move {
		cursor: grab;
	}
</style>
