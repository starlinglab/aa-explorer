<script lang="ts">
	import VerifyButton from './VerifyButton.svelte';
	import { uint8ArrayToHex, shortenCID, navigateToCID } from '$lib/index';
	import { CID } from 'multiformats/cid';
	import type {
		ListOfAttestations,
		IndividualAttestation,
		ProducedBy,
		Relationship
	} from './types';
	export let data: ListOfAttestations;
	export let selectedCID: string;

	const getKey = (att: IndividualAttestation) => att.key;
	const getAttribute = (att: IndividualAttestation) => att.value.attestation.value;
	const getTimestamp = (att: IndividualAttestation) => att.value.attestation.timestamp;
	const getPubKey = (att: IndividualAttestation) => att.value.signature.pubKey;

	const formatRelationships = (att: Relationship): CID[] => {
		return (['contextualize', 'publish', 'support', 'witness'] as (keyof Relationship)[]).flatMap(
			(key) => att[key] || []
		);
	};

	$: sortedData = [...data].sort((a, b) => {
		// Primary source attestations come first
		if (a.isPrimarySource && !b.isPrimarySource) return -1;
		if (!a.isPrimarySource && b.isPrimarySource) return 1;

		// If both from same source, sort by key
		return getKey(a).localeCompare(getKey(b));
	});
</script>

<table class="divide-y divide-gray-200 w-full">
	<thead>
		<tr>
			{#each ['H / S / T', 'Attestation & Signer', 'Value', 'Signer'] as header, i}
				<th
					class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					style="width: {i === 2 ? '70%' : '10%'}">{header}</th
				>
			{/each}
		</tr>
	</thead>
	<tbody class="bg-white divide-y divide-gray-100">
		{#each sortedData as attribute, index (attribute.key + Math.random())}
			<tr
				class={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${attribute.isPrimarySource === false ? 'opacity-60' : ''}`}
			>
				<td class="px-4 py-2 text-l text-gray-700" style="width: 10%">
					<div class="flex space-x-2">
						<VerifyButton kind={'hash'} data={attribute} {selectedCID} />
						<VerifyButton kind={'signature'} data={attribute} />
						<VerifyButton kind={'timestamp'} data={attribute} />
					</div>
				</td>
				<td class="px-4 py-2 text-xs text-gray-700 text-right" style="width: 10%">
					{getKey(attribute)}:
					{#if attribute.sourceName}
						<div class="text-xs text-gray-400">
							{attribute.sourceName}
						</div>
					{:else if attribute.sourceEndpoint}
						<div class="text-xs text-gray-400">
							{attribute.sourceEndpoint.split('.')[0].replace('https://', '')}
						</div>
					{/if}
				</td>
				<td class="px-4 py-2 text-xs text-gray-700" style="width: 70%">
					{#if getKey(attribute) === 'produced_by'}
						<div>
							<a
								href={(getAttribute(attribute) as ProducedBy).url}
								target="_blank"
								rel="noopener noreferrer">👤 {(getAttribute(attribute) as ProducedBy).name}</a
							>
							<span>({(getAttribute(attribute) as ProducedBy)['@type']})</span>
						</div>
					{:else if getKey(attribute) === 'parents' || getKey(attribute) === 'children'}
						{#each formatRelationships(getAttribute(attribute) as Relationship) as relationship}
							<a
								href={`/?selectedCID=${relationship.toString()}`}
								class="pr-2"
								on:click={(event) => navigateToCID(event, relationship.toString())}
							>
								🔗 {shortenCID(relationship.toString())}
							</a>
						{/each}
					{:else if getKey(attribute) === 'sha256' || getKey(attribute) === 'blake3'}
						{shortenCID(getAttribute(attribute))}
					{:else}
						{getAttribute(attribute)}
					{/if}
				</td>
				<td class="px-4 py-2 text-xs text-gray-700" style="width: 10%">
					{shortenCID(uint8ArrayToHex(getPubKey(attribute)))}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
