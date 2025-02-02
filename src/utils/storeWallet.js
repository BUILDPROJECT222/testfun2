import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export const getStoreWallet = () => {
  try {
    const privateKey = process.env.REACT_APP_STORE_WALLET_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('Store wallet private key not found in environment variables');
    }

    // Remove any whitespace
    const cleanPrivateKey = privateKey.trim();

    // Validate base58 format
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(cleanPrivateKey)) {
      throw new Error('Invalid private key format. Must be base58 encoded.');
    }

    // Convert base58 string to Uint8Array
    const secretKey = bs58.decode(cleanPrivateKey);
    
    // Validate key length
    if (secretKey.length !== 64) {
      throw new Error('Invalid private key length');
    }

    console.log('Store wallet created successfully');
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Error creating store wallet:', error.message);
    return null;
  }
};

export const getNetwork = () => {
  return 'devnet';
}; 