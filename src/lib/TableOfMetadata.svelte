<script lang="ts">
	import VerifyButton from './VerifyButton.svelte';
	import { uint8ArrayToHex, shortenCID } from '$lib/index';
	import type { ListOfAttestations, IndividualAttestation } from './types';
	export let data: ListOfAttestations;
	export let selectedCID: string;

	const getKey = (att: IndividualAttestation) => att.key;
	const getAttribute = (att: IndividualAttestation) => att.value.attestation.value;
	const getTimestamp = (att: IndividualAttestation) => att.value.attestation.timestamp;
	const getPubKey = (att: IndividualAttestation) => att.value.signature.pubKey;
</script>

<table class="min-w-full divide-y divide-gray-200">
	<thead>
		<tr>
			{#each ['', '', 'Attestation', 'Signature'] as header, i}
				<th
					class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					style="width: {i === 2 ? '70%' : '10%'}">{header}</th
				>
			{/each}
		</tr>
	</thead>
	<tbody class="bg-white divide-y divide-gray-100">
		{#each data as attribute: AttestationValue, index (attribute.key + Math.random())}
			<tr class={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
				<td class="px-4 py-2 text-l text-gray-700" style="width: 10%">
					<div class="flex space-x-2">
						<VerifyButton copy={'✔️'} kind={'hash'} data={attribute} {selectedCID} />
						<VerifyButton copy={'🔑'} kind={'signature'} data={attribute} />
						<VerifyButton copy={'🗓️'} kind={'timestamp'} data={attribute} />
					</div>
				</td>
				<td class="px-4 py-2 text-xs text-gray-700 text-right" style="width: 10%"
					>{getKey(attribute)}:</td
				>
				<td class="px-4 py-2 text-xs text-gray-700" style="width: 70%">{getAttribute(attribute)}</td
				>
				<td class="px-4 py-2 text-xs text-gray-700" style="width: 10%"
					>{shortenCID(uint8ArrayToHex(getPubKey(attribute)))}</td
				>
			</tr>
		{/each}
	</tbody>
</table>
