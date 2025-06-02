import { CID } from 'multiformats/cid';

interface Attestation {
	CID: CID;
	value: Object;
	attribute: string;
	encrypted: boolean;
	timestamp: string;
}

interface Signature {
	msg: CID;
	sig: Uint8Array;
	pubKey: Uint8Array;
}

interface OTS {
	proof: Uint8Array;
	upgraded: boolean;
	msg: CID;
}

export interface AttestationValue {
	attestation: Attestation;
	signature: Signature;
	timestamp: {
		ots: OTS;
	};
	version: string;
}
export interface ProducedBy {
	url: string;
	name: string;
	'@type': string;
}
export interface Relationship {
	contextualize?: CID[];
	publish?: CID[];
	support?: CID[];
	witness?: CID[];
}

export interface Registration {
	attrs: string[];
	chain: string;
	data: {
		assetCid: string;
		assetTreeCid: string;
		order_id: string;
		txHash: string;
	};
}

export type IndividualAttestation = {
	key: string;
	value: AttestationValue;
	sourceEndpoint?: string;
	sourceName?: string;
	isPrimarySource?: boolean;
	blake3?: string;
	sha256?: string;
};
export type ListOfAttestations = IndividualAttestation[];
