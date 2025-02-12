import { decode as dagCBORDecode } from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';

const ENDPOINT = 'https://chris.aa.prod.starlinglab.org';

// Helper: Checks the response and returns its ArrayBuffer.
async function handleResponse(response: Response): Promise<ArrayBuffer> {
	if (!response.ok) {
		throw new Error(`Network error: ${response.statusText}`);
	}
	return response.arrayBuffer();
}

// Helper: Decodes a Uint8Array containing CBOR data into an array of CIDs.
const decodeCBORResponse = (bytes: Uint8Array): any => dagCBORDecode(bytes);

/**
 * Fetch all CIDs from the REST endpoint.
 *
 * @param endpoint - Optional base URL; if omitted, DEFAULT_ENDPOINT is used.
 * @returns A Promise resolving to an array of CIDs.
 */
export async function fetchAllCIDs(): Promise<string[]> {
	const url = `${ENDPOINT}/v1/cids`;
	const response = await fetch(url);
	const buffer = await handleResponse(response);
	const bytes = new Uint8Array(buffer);
	return decodeCBORResponse(bytes);
}

/**
 * Fetch attestations for a given CID.
 *
 * @param cid - The CID for which to fetch attestations.
 * @returns A Promise that resolves to an array of attestations.
 */
export async function fetchAttestations(cid: string): Promise<any[]> {
	const url = `${ENDPOINT}/v1/c/${cid}`;
	const response = await fetch(url);
	const buffer = await handleResponse(response);
	const bytes = new Uint8Array(buffer);
	console.log(decodeCBORResponse(bytes));
	return decodeCBORResponse(bytes);
}

export const shortenCID = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`;
export const uint8ArrayToHex = (arr: Uint8Array): string => {
	return Array.from(arr)
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
};
