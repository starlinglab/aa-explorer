<script lang="ts">
	import { uint8ArrayToHex, shortenCID } from '$lib/index';
	import type { ListOfAttestations, IndividualAttestation } from '../lib/types';
	export let data: ListOfAttestations;

	const getKey = (att: IndividualAttestation) => att.key;
	const getAttribute = (att: IndividualAttestation) => att.value.attestation.value;
	const getTimestamp = (att: IndividualAttestation) => att.value.attestation.timestamp;
	const getPubKey = (att: IndividualAttestation) => att.value.signature.pubKey;
</script>

<table class="min-w-full divide-y divide-gray-200">
	<thead>
		<tr>
			{#each ['Attribute', 'Attestation', 'Signature', 'Timestamp'] as header}
				<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>{header}</th
				>
			{/each}
		</tr>
	</thead>
	<tbody class="bg-white divide-y divide-gray-200">
		{#each data as attribute: AttestationValue (attribute.key + Math.random())}
			<tr>
				<td class="px-4 py-2 text-xs text-gray-700">{getKey(attribute)}</td>
				<td class="px-4 py-2 text-xs text-gray-700">{getAttribute(attribute)}</td>
				<td class="px-4 py-2 text-xs text-gray-700"
					>{shortenCID(uint8ArrayToHex(getPubKey(attribute)))}</td
				>
				<td class="px-4 py-2 text-xs text-gray-700">{getTimestamp(attribute)}</td>
			</tr>
		{/each}
	</tbody>
</table>
