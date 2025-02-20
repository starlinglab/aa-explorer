interface Attestation {
	CID: string;
	value: string;
	attribute: string;
	encrypted: boolean;
	timestamp: string;
}

interface Signature {
	msg: string;
	sig: Uint8Array;
	pubKey: Uint8Array;
}

export interface AttestationValue {
	attestation: Attestation;
	signature: Signature;
	timestamp: {
		ots: object;
	};
}

export type IndividualAttestation = { key: string; value: AttestationValue };
export type ListOfAttestations = IndividualAttestation[];
