import bs58 from 'bs58';

export const convertPrivateKey = (base58PrivateKey) => {
  const decoded = bs58.decode(base58PrivateKey);
  return Array.from(decoded);
}; 