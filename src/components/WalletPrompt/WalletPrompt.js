import React from 'react';
import { useWallet } from '../../context/WalletContext';
import './WalletPrompt.css';

const WalletPrompt = () => {
  const { connectWallet } = useWallet();

  return (
    <div className="wallet-prompt">
      <h2>Connect Your Wallet</h2>
      <p>Please connect your wallet to continue</p>
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
};

export default WalletPrompt; 