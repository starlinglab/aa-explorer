import { CID } from 'multiformats/cid'

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

export type IndividualAttestation = { key: string; value: AttestationValue };
export type ListOfAttestations = IndividualAttestation[];
