<script lang="ts">
	export let showModal: boolean;
	export let title: string = '';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function closeModal() {
		showModal = false;
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeModal();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showModal}
	<div
		class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
		on:click={handleBackdropClick}
		role="button"
		tabindex="0"
		on:keydown={handleKeydown}
	>
		<div
			class="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-auto"
			role="dialog"
			aria-modal="true"
		>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-bold">{title}</h2>
				<button class="text-gray-500 hover:text-gray-700" on:click={closeModal}>✕</button>
			</div>
			<div class="mb-4">
				<slot></slot>
			</div>
			<div class="flex justify-end">
				<button
					class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					on:click={closeModal}>Close</button
				>
			</div>
		</div>
	</div>
{/if}
