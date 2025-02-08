import { groth16 } from "snarkjs";
import { existsSync, readFileSync } from "fs";
import { verificationKeyPath } from '../config/index.js';

class ZkService {
    constructor() {
        try {
            if (!existsSync(verificationKeyPath)) {
                console.error(`Verification key not found at: ${verificationKeyPath}`);
                console.error('Please ensure you have generated the verification key');
                process.exit(1);
            }
            this.verificationKey = JSON.parse(readFileSync(verificationKeyPath));
        } catch (error) {
            console.error('Error loading verification key:', error);
            process.exit(1);
        }
    }

    async verifyProof(proof, publicSignals) {
        return await groth16.verify(this.verificationKey, publicSignals, proof);
    }
}

export default new ZkService(); 