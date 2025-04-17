<script lang="ts">
	import { CopyIcon, CheckmarkIcon } from './icons';

	export let textToCopy: string;
	export let shortText: string | null = null;
	export let label: string = 'Copy to clipboard';
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

{#if shortText && displayStyle !== 'icon'}
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
		<span class="inline-flex items-center gap-1">
			<CheckmarkIcon class="w-4 h-4 text-green-500" />
			<span>Copied!</span>
		</span>
	{:else}
		{#if displayStyle === 'icon' || displayStyle === 'both'}
			<span class="mr-1 inline-flex items-center">
				<CopyIcon class="w-4 h-4" />
			</span>
		{/if}
		{#if displayStyle === 'text' || displayStyle === 'both'}
			<span class="text-xs">{displayStyle === 'both' ? 'Click to copy' : 'Copy'}</span>
		{/if}
	{/if}
</button>