import * as dagCbor from '@ipld/dag-cbor';
import * as block from 'multiformats/block';
import { sha256 } from 'multiformats/hashes/sha2';
import * as ed from '@noble/ed25519';
import type { AttestationValue, IndividualAttestation } from './types';

// Known public keys array - should be moved to a global store
const knownPubkeys: Array<Uint8Array> = [];

// Define a new result type for more nuanced verification outcomes
export type VerificationResult = {
	status: 'verified' | 'unverified' | 'present' | 'unknown_key';
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
					return { status: 'verified' };
				} else if (valid && !knownKey) {
					return { status: 'unknown_key' };
				} else {
					return { status: 'present' };
				}
			}
			return { status: 'unverified' }; // No signature at all
		case 'timestamp':
			// For timestamp, check if timestamp is present first
			if (data.value.timestamp && data.value.timestamp.ots) {
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
	// Get OpenTimestamps from window
	const OpenTimestamps = (window as any).OpenTimestamps;

	const timestampedBlock = await block.encode({
		value: { signature: av.signature, attestation: av.attestation },
		codec: dagCbor,
		hasher: sha256
	});
	if (!timestampedBlock.cid.equals(av.timestamp.ots.msg)) {
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
		result = OpenTimestamps.verify(detachedOts, detached, { ignoreBitcoinNode: true }) as
			| Record<string, { timestamp: number; height: number }>
			| undefined;
	} catch (error) {
		console.log('timestamp verification error:', error);
		return false;
	}
	return result != null;
};
