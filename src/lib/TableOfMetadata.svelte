<script lang="ts">
	import VerifyButton from './VerifyButton.svelte';
	import { uint8ArrayToHex, shortenCID, navigateToCID, CopyButton, setAttestation } from '$lib/index';
	import type { EndpointConfig } from '$lib/index';
	import { CID } from 'multiformats/cid';
	import { knownPublicKeys } from './stores';
	import { get } from 'svelte/store';
	import type {
		ListOfAttestations,
		IndividualAttestation,
		ProducedBy,
		Relationship,
		Registration
	} from './types';
	export let data: ListOfAttestations;
	export let selectedCID: string;
	export let editEndpoint: EndpointConfig | undefined = undefined;
	export let onSaved: (() => void) | undefined = undefined;

	let editingKey: string | null = null;
	let editingValue = '';
	let saving = false;
	let saveError: string | null = null;

	function startEdit(att: IndividualAttestation) {
		editingKey = att.key;
		const v = att.value?.attestation?.value;
		editingValue = typeof v === 'string' ? v : JSON.stringify(v);
		saveError = null;
	}

	async function saveEdit(key: string) {
		if (!editEndpoint || !selectedCID) return;
		saving = true;
		saveError = null;
		try {
			let parsed: unknown;
			try { parsed = JSON.parse(editingValue); } catch { parsed = editingValue; }
			await setAttestation(editEndpoint, selectedCID, key, parsed);
			editingKey = null;
			onSaved?.();
		} catch (e: any) {
			saveError = e.message;
		} finally {
			saving = false;
		}
	}

	const getKey = (att: IndividualAttestation) => att.key;
	const getAttribute = (att: IndividualAttestation) => att.value.attestation.value;
	const getTimestamp = (att: IndividualAttestation) => att.value.attestation.timestamp;
	const getPubKey = (att: IndividualAttestation) => att.value.signature.pubKey;

	// Function to find a public key's name
	// hacky hacky I'm worried
	const getPubKeyName = (att: IndividualAttestation): string | null => {
		const pubKeyHex = Array.from(att.value.signature.pubKey)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		const keys = get(knownPublicKeys);
		const knownKey = keys.find((entry) => entry.key === pubKeyHex);
		return knownKey?.name || null;
	};

	const formatRelationships = (att: Relationship): CID[] => {
		return (['contextualize', 'publish', 'support', 'witness'] as (keyof Relationship)[]).flatMap(
			(key) => att[key] || []
		);
	};

	// Function to get registration info for attributes from the registrations data
	const getRegisteredAttributes = (data: ListOfAttestations): Map<string, Registration[]> => {
		const registeredAttrs = new Map<string, Registration[]>();
		const cardanoSpecificAttrs = ['sha256', 'time_created', 'media_type'];

		const registrationsAttestation = data.find((att) => getKey(att) === 'registrations');
		if (registrationsAttestation) {
			const registrations = getAttribute(registrationsAttestation) as Registration[];
			if (Array.isArray(registrations)) {
				registrations.forEach((registration) => {
					// For Numbers chain and others: use the attrs array
					if (
						registration.chain !== 'cardano' &&
						registration.attrs &&
						Array.isArray(registration.attrs)
					) {
						registration.attrs.forEach((attr) => {
							if (!registeredAttrs.has(attr)) {
								registeredAttrs.set(attr, []);
							}
							registeredAttrs.get(attr)!.push(registration);
						});
					}
					// For Cardano chain: use hardcoded attributes
					else if (registration.chain === 'cardano') {
						cardanoSpecificAttrs.forEach((attr) => {
							if (!registeredAttrs.has(attr)) {
								registeredAttrs.set(attr, []);
							}
							registeredAttrs.get(attr)!.push(registration);
						});
					}
				});
			}
		}

		return registeredAttrs;
	};

	// Function to get blockchain explorer URL based on chain and txHash
	const getBlockchainExplorerUrl = (chain: string, txHash: string): string => {
		switch (chain) {
			case 'numbers':
				return `https://mainnet.num.network/tx/${txHash}`;
			case 'cardano':
				return `https://preview.cardanoscan.io/transaction/${txHash}`;
			default:
				return '';
		}
	};

	$: sortedData = [...data]
		.filter((att) => getKey(att) !== 'registrations')
		.sort((a, b) => {
			// Primary source attestations come first
			if (a.isPrimarySource && !b.isPrimarySource) return -1;
			if (!a.isPrimarySource && b.isPrimarySource) return 1;

			// If both from same source, sort by key
			return getKey(a).localeCompare(getKey(b));
		});

	$: registeredAttributes = getRegisteredAttributes(data);
</script>

<table class="divide-y divide-gray-200 w-full">
	<thead>
		<tr>
			{#each ['H / S / T', 'Attribute', 'Value', 'Signature'] as header, i}
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
				class={`group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${attribute.isPrimarySource === false ? 'opacity-60' : ''}`}
			>
				<td class="px-4 py-2 text-l text-gray-700">
					<div class="flex space-x-2">
						<VerifyButton kind={'hash'} data={attribute} {selectedCID} />
						<VerifyButton kind={'signature'} data={attribute} />
						<VerifyButton kind={'timestamp'} data={attribute} />
					</div>
				</td>
				<td class="px-4 py-2 text-xs text-gray-500 text-right">
					{getKey(attribute)}:
				</td>
				<td class="px-4 py-2 text-xs text-gray-700">
					{#if editingKey === attribute.key}
						<div class="flex items-center gap-1">
							<input
								bind:value={editingValue}
								class="border rounded px-1 py-0.5 text-xs flex-1 min-w-0"
								on:keydown={(e) => { if (e.key === 'Enter') saveEdit(attribute.key); if (e.key === 'Escape') editingKey = null; }}
							/>
							<button
								on:click={() => saveEdit(attribute.key)}
								disabled={saving}
								class="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
							>{saving ? '…' : 'Save'}</button>
							<button
								on:click={() => editingKey = null}
								class="text-xs text-gray-400 hover:text-gray-600"
							>✕</button>
						</div>
						{#if saveError}<p class="text-red-500 text-xs mt-1">{saveError}</p>{/if}
					{:else}
						<span class="inline-flex items-center gap-1">
							{#if getKey(attribute) === 'produced_by'}
								<span>
									<a
										href={(getAttribute(attribute) as ProducedBy).url}
										target="_blank"
										rel="noopener noreferrer">👤 {(getAttribute(attribute) as ProducedBy).name}</a
									>
									<span>({(getAttribute(attribute) as ProducedBy)['@type']})</span>
								</span>
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
								<span class="font-mono">{shortenCID(String(getAttribute(attribute)))}</span>
								<CopyButton
									textToCopy={String(getAttribute(attribute))}
									label="Copy {getKey(attribute)} hash"
									displayStyle="icon"
								/>
							{:else}
								{getAttribute(attribute)}
							{/if}
							{#if editEndpoint?.jwt}
								<button
									on:click={() => startEdit(attribute)}
									class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blue-500 transition-opacity ml-1"
									title="Edit value"
								>✎</button>
							{/if}
						</span>
						{#if registeredAttributes.has(getKey(attribute))}
							{@const registrations = registeredAttributes.get(getKey(attribute))}
							<br /><span class="text-xs text-gray-500"
								>(registered on: {#each registrations || [] as registration, i}{#if i > 0},
									{/if}{@const txHash =
										registration.chain === 'cardano'
											? (registration.data as any).tx_hash
											: (registration.data as any).txHash}{@const explorerUrl =
										getBlockchainExplorerUrl(registration.chain, txHash)}{#if explorerUrl}<a
											href={explorerUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="text-blue-500 hover:underline">{registration.chain}</a
										>{:else}{registration.chain}{/if}{/each})</span
							>
						{/if}
					{/if}
				</td>
				<td class="px-4 py-2 text-xs text-gray-700">
					{#if getPubKeyName(attribute)}
						By {getPubKeyName(attribute)} <br />
					{:else}
						By unknown signer <br />
					{/if}
					<span class="text-gray-400"
						>(pubkey: {shortenCID(uint8ArrayToHex(getPubKey(attribute)))})</span
					>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
