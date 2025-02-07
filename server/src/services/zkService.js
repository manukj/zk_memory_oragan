const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require('path');
const { verificationKeyPath } = require('../config');

class ZkService {
    constructor() {
        try {
            if (!fs.existsSync(verificationKeyPath)) {
                console.error(`Verification key not found at: ${verificationKeyPath}`);
                console.error('Please ensure you have generated the verification key');
                process.exit(1);
            }
            this.verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath));
        } catch (error) {
            console.error('Error loading verification key:', error);
            process.exit(1);
        }
    }

    async verifyProof(proof, publicSignals) {
        return await snarkjs.groth16.verify(this.verificationKey, publicSignals, proof);
    }
}

module.exports = new ZkService(); 