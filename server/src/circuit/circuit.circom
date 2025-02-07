pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template Main() {
    // Input signals
    signal input userSecret; // wallet address as number
    signal input signature; // signature as number
    signal input storedHash;
    
    // Calculate hash of the secret (wallet address)
    component addressHasher = Poseidon(1);
    addressHasher.inputs[0] <== userSecret;
    
    // Verify the stored hash matches
    addressHasher.out === storedHash;
    
    // Generate nullifier using address and signature
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== userSecret;
    nullifierHasher.inputs[1] <== signature;
    
    // Output signals
    signal output nullifier;
    signal output publicHash;
    
    // Assign outputs
    nullifier <== nullifierHasher.out;
    publicHash <== addressHasher.out;
}

component main = Main();
