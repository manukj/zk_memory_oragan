const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up ZK-SNARK circuit...');

try {
    // Compile circuit
    execSync('circom circuit.circom --r1cs --wasm --sym');
    
    // Generate verification key
    execSync('snarkjs groth16 setup build/circuit.r1cs pot12_final.ptau build/circuit_0000.zkey');
    execSync('snarkjs zkey export verificationkey build/circuit_0000.zkey build/verification_key.json');
    
    console.log('Setup completed successfully!');
} catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
} 