<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import { type EndpointConfig, endpoints } from './index';

	export let showModal = false;

	let endpointsList: (EndpointConfig & { id: string })[] = [];
	
	// Subscribe to the endpoints store and update our local list whenever it changes
	const unsubscribe = endpoints.subscribe(currentEndpoints => {
		endpointsList = currentEndpoints.map((endpoint, index) => ({
			name: endpoint.name,
			url: endpoint.url,
			id: `endpoint-${index}`
		}));
	});
	
	// Clean up subscription when component is destroyed
	onMount(() => {
		return () => {
			unsubscribe();
		};
	});

	// Update the endpoints store when the user saves changes
	function saveChanges() {
		// Update the endpoints store with the new configuration
		const updatedEndpoints = endpointsList.map(item => ({
			name: item.name,
			url: item.url
		}));
		
		endpoints.set(updatedEndpoints);
		
		// Close the modal
		showModal = false;
	}

	// Add a new endpoint
	function addEndpoint() {
		const newEndpoint = {
			name: 'New Endpoint',
			url: 'https://'
		};
		endpointsList = [
			...endpointsList,
			{ ...newEndpoint, id: `endpoint-${endpointsList.length}` }
		];
	}

	// Remove an endpoint
	function removeEndpoint(index: number) {
		endpointsList = endpointsList.filter((_, i) => i !== index);
	}

	// Handle endpoint field changes
	function handleEndpointChange(index: number, field: 'name' | 'url', newValue: string) {
		const updatedList = [...endpointsList];
		updatedList[index][field] = newValue;
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
					<div class="flex-grow grid grid-cols-2 gap-2">
						<input
							type="text"
							class="p-2 border border-gray-300 rounded"
							placeholder="Display Name"
							value={endpoint.name}
							on:input={(e) => handleEndpointChange(index, 'name', e.currentTarget.value)}
						/>
						<input
							type="text"
							class="p-2 border border-gray-300 rounded"
							placeholder="URL"
							value={endpoint.url}
							on:input={(e) => handleEndpointChange(index, 'url', e.currentTarget.value)}
						/>
					</div>
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