<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchAllCIDs, shortenCID } from '$lib/index';

	let data: {
		cids?: Array<string>;
		error?: string;
	} = {};

	onMount(async () => {
		try {
			const cids = await fetchAllCIDs();
			data.cids = cids;
		} catch (err: any) {
			data.error = err.message;
		}
	});
</script>

<div class="p-4">
	{#if data.error}
		<p class="text-red-500">Error: {data.error}</p>
	{:else if !data.cids || data.cids.length === 0}
		<p>Loading...</p>
	{:else}
		<!-- Flex container to neatly arrange the items -->
		<div class="flex flex-wrap gap-2">
			{#each data.cids as cid (cid.toString())}
				<div
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
				</div>
			{/each}
		</div>
	{/if}
</div>
