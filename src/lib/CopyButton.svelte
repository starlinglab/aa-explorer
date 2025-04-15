<script lang="ts">
	export let textToCopy: string;
	export let shortText: string | null = null;
	export let label: string = 'Copy to clipboard';
	export let showFullText: boolean = true;
	export let displayStyle: 'icon' | 'text' | 'both' = 'both';
	
	let hasCopied: boolean = false;
	
	function copyToClipboard() {
		if (textToCopy) {
			navigator.clipboard.writeText(textToCopy);
			hasCopied = true;
			setTimeout(() => {
				hasCopied = false;
			}, 3000);
		}
	}
</script>

{#if showFullText && shortText}
	<span class="font-mono">{shortText}</span>
{/if}

<button
	type="button"
	class="cursor-pointer text-blue-500 hover:underline ml-2 align-middle"
	on:click={copyToClipboard}
	aria-label={label}
	title={label}
>
	{#if hasCopied}
		<span>✅ Copied!</span>
	{:else}
		{#if displayStyle === 'icon' || displayStyle === 'both'}
			<span class="mr-1">📋</span>
		{/if}
		{#if displayStyle === 'text' || displayStyle === 'both'}
			<span class="text-xs">{showFullText ? '(click to copy full text)' : 'Copy'}</span>
		{/if}
	{/if}
</button>