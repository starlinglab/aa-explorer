import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { EndpointConfig } from './index';
import type { IndividualAttestation } from './types';

// Known public keys store with name property
export type NamedPublicKey = {
	name: string;
	key: string;
};

export const knownPublicKeys = writable<NamedPublicKey[]>([
	{
		name: 'D.Guttenfelder',
		key: 'd8b304cdf6fca3c8c7db9932f92aac84eec095d8e166b6c13dabfe28091fec7b'
	},
	{
		name: 'Starling Ingest Server',
		key: '4b512f301b92c7dfe60d034c7a4a13a578aa208b37e9662b110e16dd51deff7a'
	}
]);

// Initial endpoint configs
const defaultEndpoints: EndpointConfig[] = [
	{
		name: 'EE292J 2026',
		url: 'http://ee292j-2026.aa.dev.starlinglab.org'
	},
	{
		name: 'Group 1',
		url: 'http://ee292j-2026.aa1.dev.starlinglab.org'
	},
	{
		name: 'Group 2',
		url: 'http://ee292j-2026.aa2.dev.starlinglab.org'
	},
	{
		name: 'D. Guttenfelder',
		url: 'https://stanford.aa.dev.starlinglab.org'
	},
	{
		name: 'K. Pollack',
		url: 'https://kira.aa.prod.starlinglab.org'
	},
	{
		name: 'C. Morris',
		url: 'https://chris.aa.prod.starlinglab.org'
	}
];

// Load endpoints from localStorage on init
const initEndpoints = (): EndpointConfig[] => {
	if (browser) {
		const storedEndpoints = localStorage.getItem('aa-explorer-endpoints');
		if (storedEndpoints) {
			try {
				const parsedEndpoints = JSON.parse(storedEndpoints) as EndpointConfig[];
				if (parsedEndpoints && parsedEndpoints.length > 0) {
					return parsedEndpoints;
				}
			} catch (e) {
				console.error('Failed to parse stored endpoints:', e);
			}
		}
	}
	return [...defaultEndpoints];
};

// Create a writable store for endpoints
export const endpoints = writable<EndpointConfig[]>(initEndpoints());

// Create a store for the selected CID
export const selectedCID = writable<string | null>(null);

// Save endpoints to localStorage whenever they change
endpoints.subscribe((value) => {
	if (browser) {
		localStorage.setItem('aa-explorer-endpoints', JSON.stringify(value));
	}
});

// Store for managing verification modals
export type VerificationModalData = {
	show: boolean;
	kind: 'hash' | 'signature' | 'timestamp';
	data: IndividualAttestation | null;
	selectedCID: string | null;
};

// Default state
const defaultVerificationModal: VerificationModalData = {
	show: false,
	kind: 'hash',
	data: null,
	selectedCID: null
};

// Create store
export const verificationModalStore = writable<VerificationModalData>(defaultVerificationModal);

// Helper functions
export function showVerificationModal(
	kind: 'hash' | 'signature' | 'timestamp',
	data: IndividualAttestation,
	selectedCID: string | null
) {
	verificationModalStore.set({
		show: true,
		kind,
		data,
		selectedCID
	});
}

export function hideVerificationModal() {
	// Only set show to false and keep the other data intact
	verificationModalStore.update((state) => ({ ...state, show: false }));
}
