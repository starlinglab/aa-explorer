import { decode as dagCBORDecode } from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';

const ENDPOINT = 'https://kira.aa.prod.starlinglab.org';

// Helper: Checks the response and returns its ArrayBuffer.
async function handleResponse(response: Response): Promise<ArrayBuffer> {
	if (!response.ok) {
		throw new Error(`Network error: ${response.statusText}`);
	}
	return response.arrayBuffer();
}

// Helper: Decodes a Uint8Array containing CBOR data into an array of CIDs.
function decodeCBORResponse(bytes: Uint8Array): string[] {
	// Decode the CBOR bytes using dag-cbor.
	const decoded = dagCBORDecode(bytes);

	// Expecting the decoded result to be an array.
	if (!Array.isArray(decoded)) {
		throw new Error('Invalid CBOR format: expected an array');
	}

	return decoded.map((item: any) => {
		// Do we have a Uint8Array? It doesn't appear so.
		// const cidBytes = item instanceof Uint8Array ? item : new Uint8Array(item);
		return item;
	});
}

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

export const shortenCID = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`;
