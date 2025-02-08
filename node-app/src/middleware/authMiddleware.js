import { ethers } from 'ethers';

/**
 * Expects JSON body:
 * {
 *   "walletAddress": "0x1234...",
 *   "signature": "0xabcd...",
 *   "nonce": "some random string",
 *     "doc": {
 *       "_id": "stringPk",
 *       "data": "string"
 *     }
 * }
 */
async function verifyWalletSignature(req, res, next) {
  const { walletAddress, signature, nonce } = req.body;

  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing walletAddress, signature, or nonce' });
  }

  try {
    const recovered = ethers.utils.verifyMessage(nonce, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
    req.verifiedAddress = recovered;
    next();
  } catch (err) {
    console.error('Signature verification error:', err);
    return res.status(401).json({ error: 'Invalid signature' });
  }
}

export default verifyWalletSignature;
