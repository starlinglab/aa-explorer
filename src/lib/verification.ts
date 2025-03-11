import * as dagCbor from '@ipld/dag-cbor';
import * as block from 'multiformats/block';
import { sha256 } from 'multiformats/hashes/sha2';
import * as ed from '@noble/ed25519';
import type { AttestationValue, IndividualAttestation } from './types';

// Known public keys array - should be moved to a global store
const knownPubkeys: Array<Uint8Array> = [];

export async function verifyData(
	kind: 'hash' | 'signature' | 'timestamp',
	data: IndividualAttestation,
	selectedCID: string | null
): Promise<boolean> {
	switch (kind) {
		case 'hash':
			// compare data.value.attestation.CID to on-demand computed CID of the attestation
			return data.value.attestation.CID.toString() === selectedCID;
		case 'signature':
			// verify validity of data.value.signature
			return await verifySignature(data.value);
		case 'timestamp':
			// verify timestamp
			// return await verifyTimestamp(data.value);
			return true;
		default:
			console.log('Unknown kind:', kind);
			return false;
	}
}

export const verifySignature = async (av: AttestationValue): Promise<boolean> => {
	if (!knownPubkeys.includes(av.signature.pubKey)) {
		return false;
	}
	const attBlock = await block.encode({
		value: av.attestation,
		codec: dagCbor,
		hasher: sha256
	});
	if (!attBlock.cid.equals(av.signature.msg)) {
		return false;
	}
	return await ed.verifyAsync(av.signature.sig, av.signature.msg.bytes, av.signature.pubKey);
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
