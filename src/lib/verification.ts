import * as dagCbor from '@ipld/dag-cbor';
import * as block from 'multiformats/block';
import { sha256 } from 'multiformats/hashes/sha2';
import * as ed from '@noble/ed25519';
import type { AttestationValue, IndividualAttestation } from './types';

// Known public keys array - should be moved to a global store
// Unsure what's best here
const knownPubkeys: Array<Uint8Array> = [];

// Cache and rate-limiting for timestamp verification
// Map of CID string to { timestamp: Date, result: boolean }
const timestampVerificationCache = new Map<string, { timestamp: Date, result: boolean }>();
const TIMESTAMP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Define a new result type for more nuanced verification outcomes
export type VerificationResult = {
	status: 'verified' | 'unverified' | 'present' | 'unknown_key' | 'cached';
	cachedValue?: boolean; // For cached results, the previously computed value
	cacheTimestamp?: Date; // When the result was cached
};

export async function verifyData(
	kind: 'hash' | 'signature' | 'timestamp',
	data: IndividualAttestation,
	selectedCID: string | null
): Promise<VerificationResult> {
	switch (kind) {
		case 'hash':
			// compare data.value.attestation.CID to on-demand computed CID of the attestation
			return {
				status: data.value.attestation.CID.toString() === selectedCID ? 'verified' : 'unverified'
			};
		case 'signature':
			// For signature, check if signature is present first
			if (data.value.signature) {
				// If signature exists, verify it
				const { valid, knownKey } = await verifySignature(data.value);
				
				if (valid && knownKey) {
					return { status: 'verified' }; // Signature valid, known key
				} else if (valid && !knownKey) {
					return { status: 'unknown_key' }; // Signature valid, unknown key
				} else {
					return { status: 'present' }; // Signature exists but doesn't verify
				}
			}
			return { status: 'unverified' }; // No signature at all
		case 'timestamp':
			// For timestamp, check if timestamp is present first
			if (data.value.timestamp && data.value.timestamp.ots) {
				// Get timestamp ID for cache lookup
				const timestampId = data.value.timestamp.ots.msg.toString();
				const cachedResult = timestampVerificationCache.get(timestampId);
				
				// Check if we have a relatively fresh cached result
				if (cachedResult) {
					const now = new Date();
					const cacheAge = now.getTime() - cachedResult.timestamp.getTime();
					
					// If cache is still valid but very fresh (< 30 seconds), return cached status
					if (cacheAge < 30000) { // 30 seconds - very fresh cache gets special cached status
						return {
							status: 'cached',
							cachedValue: cachedResult.result,
							cacheTimestamp: cachedResult.timestamp
						};
					}
					// Older cached results (30s-5min) will just flow through to regular verification
					// which will use the cache internally but won't show "cached" status to user
				}
				
				// If timestamp exists, verify it
				try {
					const isTimestampValid = await verifyTimestamp(data.value);
					return {
						status: isTimestampValid ? 'verified' : 'present' // 'present' means timestamp exists but doesn't verify
					};
				} catch (error) {
					console.log('Error verifying timestamp:', error);
					return { status: 'present' }; // Error during verification but timestamp exists
				}
			}
			return { status: 'unverified' }; // No timestamp at all
		default:
			console.log('Unknown kind:', kind);
			return { status: 'unverified' };
	}
}

export const verifySignature = async (
	av: AttestationValue
): Promise<{ valid: boolean; knownKey: boolean }> => {
	const isKnownKey = knownPubkeys.includes(av.signature.pubKey);
	
	// First check if the CID matches the message
	const attBlock = await block.encode({
		value: av.attestation,
		codec: dagCbor,
		hasher: sha256
	});
	if (!attBlock.cid.equals(av.signature.msg)) {
		// CID mismatch means invalid signature
		return { valid: false, knownKey: isKnownKey };
	}

	// Verify the signature cryptographically
	const isValid = await ed.verifyAsync(
		av.signature.sig,
		av.signature.msg.bytes,
		av.signature.pubKey
	);

	return { valid: isValid, knownKey: isKnownKey };
};

export const verifyTimestamp = async (av: AttestationValue): Promise<boolean> => {
	// Get timestamp ID (use the CID of the timestamp message)
	const timestampId = av.timestamp.ots.msg.toString();
	
	// Check if we have a cached result
	const cachedResult = timestampVerificationCache.get(timestampId);
	if (cachedResult) {
		const now = new Date();
		// If the cache entry is still valid
		if (now.getTime() - cachedResult.timestamp.getTime() < TIMESTAMP_CACHE_TTL) {
			console.log(`Using cached timestamp verification result for ${timestampId}`);
			return cachedResult.result;
		} else {
			// Expired cache entry, remove it
			timestampVerificationCache.delete(timestampId);
		}
	}

	// Get OpenTimestamps from window
	const OpenTimestamps = (window as any).OpenTimestamps;

	// First, verify that the timestamp message matches what we expect
	const timestampedBlock = await block.encode({
		value: { signature: av.signature, attestation: av.attestation },
		codec: dagCbor,
		hasher: sha256
	});
	if (!timestampedBlock.cid.equals(av.timestamp.ots.msg)) {
		// Cache the negative result
		timestampVerificationCache.set(timestampId, { 
			timestamp: new Date(), 
			result: false 
		});
		return false;
	}

	// https://github.com/opentimestamps/javascript-opentimestamps?tab=readme-ov-file#verify-1
	// Timestamp is on text version of CID, see AA code
	const file: Uint8Array = new TextEncoder().encode(av.timestamp.ots.msg.toString());
	const fileOts: Uint8Array = av.timestamp.ots.proof;
	const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(
		new OpenTimestamps.Ops.OpSHA256(),
		file
	);
	const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(fileOts);
	let result = undefined;
	
	try {
		// Log when we're making actual blockchain verification requests
		console.log(`Verifying timestamp for ${timestampId} with OpenTimestamps...`);
		
		result = OpenTimestamps.verify(detachedOts, detached, { ignoreBitcoinNode: true }) as
			| Record<string, { timestamp: number; height: number }>
			| undefined;
			
		// Cache the result (positive or negative)
		const isVerified = result != null;
		timestampVerificationCache.set(timestampId, { 
			timestamp: new Date(), 
			result: isVerified 
		});
		
		return isVerified;
	} catch (error) {
		console.log('Timestamp verification error:', error);
		
		// Cache the error result
		timestampVerificationCache.set(timestampId, { 
			timestamp: new Date(), 
			result: false 
		});
		
		return false;
	}
};