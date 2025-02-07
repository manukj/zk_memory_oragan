import { useState } from 'react';
import { buildPoseidon } from 'circomlibjs';
import * as snarkjs from 'snarkjs';
import { ethers } from 'ethers';

export function useZkProof() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateProof = async (account, signer) => {
        setIsGenerating(true);
        try {
            const poseidon = await buildPoseidon();
            
            const message = `Sign this message to generate your unique identifier: ${account}`;
            const signature = await signer.signMessage(message);
            
            const signatureBytes = ethers.utils.arrayify(signature).slice(0, 32);
            const signatureNumber = ethers.BigNumber.from(signatureBytes).toString();
            
            const addressNumber = BigInt(parseInt(account.slice(2), 16)).toString();
            const hash = poseidon([BigInt(addressNumber)]);
            const hashStr = poseidon.F.toString(hash);

            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                { 
                    userSecret: addressNumber,
                    signature: signatureNumber,
                    storedHash: hashStr
                },
                "/circuits/circuit.wasm",
                "/circuits/circuit_0000.zkey"
            );

            return {
                proof,
                publicSignals,
                signature,
                message
            };
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generateProof,
        isGenerating
    };
} 