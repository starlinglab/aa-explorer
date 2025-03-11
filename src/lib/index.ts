import { decode as dagCBORDecode } from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';

export type Endpoint =
	| 'https://chris.aa.prod.starlinglab.org'
	| 'https://kira.aa.prod.starlinglab.org';
const ENDPOINT_CHRIS: Endpoint = 'https://chris.aa.prod.starlinglab.org';
const ENDPOINT_KIRA: Endpoint = 'https://kira.aa.prod.starlinglab.org';
// Can be reordered!
export let ENDPOINTS: Endpoint[] = [ENDPOINT_CHRIS, ENDPOINT_KIRA];

// Helper: Checks the response and returns its ArrayBuffer.
async function handleResponse(response: Response): Promise<ArrayBuffer> {
	if (!response.ok) {
		throw new Error(`Network error: ${response.statusText}`);
	}
	return response.arrayBuffer();
}

// Helper: Decodes a Uint8Array containing CBOR data into an array of CIDs.
const decodeCBORResponse = (bytes: Uint8Array): any => dagCBORDecode(bytes);

// Helper: Fetches and decodes CBOR data from a given URL.
async function fetchAndDecode(url: string): Promise<any> {
	const response = await fetch(url);
	const buffer = await handleResponse(response);
	const bytes = new Uint8Array(buffer);
	return decodeCBORResponse(bytes);
}

/**
 * Fetch all CIDs from a REST endpoint.
 *
 * @param endpoint - Base URL.
 * @returns A Promise resolving to an array of CIDs.
 */
async function fetchCIDsFromEndpoint(endpoint: Endpoint): Promise<string[]> {
	const url = `${endpoint}/v1/cids`;
	return fetchAndDecode(url);
}

/**
 * Fetches all CIDs from multiple endpoints.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of CIDs.
 */
export async function fetchAllCIDs(): Promise<string[]> {
	const results = await Promise.all(ENDPOINTS.map((endpoint) => fetchCIDsFromEndpoint(endpoint)));
	return results.flat();
}

/**
 * Fetch attestations from a specific endpoint for a given CID.
 *
 * @param endpoint - The endpoint to fetch from.
 * @param cid - The CID for which to fetch attestations.
 * @returns A Promise that resolves to a map of attestations.
 */
async function fetchAttestationsFromEndpoint(endpoint: Endpoint, cid: string): Promise<{}> {
	const url = `${endpoint}/v1/c/${cid}`;
	return fetchAndDecode(url);
}

/**
 * Fetches attestations for a given CID from multiple endpoints.
 *
 * @param {string} cid - The content identifier for which to fetch attestations.
 * @returns {Promise<{}[]>} A promise that resolves to an array of attestation key-value pairs with source information.
 */
export async function fetchAllAttestations(cid: string): Promise<{}[]> {
	const results = await Promise.all(
		ENDPOINTS.map(async (endpoint, endpointIndex) => {
			const attestations = await fetchAttestationsFromEndpoint(endpoint, cid);
			return Object.entries(attestations).map(([key, value]) => ({
				key,
				value,
				sourceEndpoint: endpoint,
				isPrimarySource: endpointIndex === 0 // First endpoint in order is considered primary
			}));
		})
	);
	return results.flat();
}

export const shortenCID = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`;
export const uint8ArrayToHex = (arr: Uint8Array): string => {
	return Array.from(arr)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};

/**
 * Navigate to a CID by updating the URL parameters and triggering a popstate event.
 * Used for in-app navigation between CIDs.
 *
 * @param event - The original event (click or keydown)
 * @param cid - The CID to navigate to
 */
export function navigateToCID(event: Event, cid: string | undefined): void {
	if (!cid) return;
	event.preventDefault();
	const url = new URL(window.location.href);
	url.searchParams.set('selectedCID', cid);
	window.history.pushState({}, '', url);
	window.dispatchEvent(new Event('popstate'));
}
