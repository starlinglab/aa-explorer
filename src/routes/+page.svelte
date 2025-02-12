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
