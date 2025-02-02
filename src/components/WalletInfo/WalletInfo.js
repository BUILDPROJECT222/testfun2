import React from 'react';
import './WalletInfo.css';

const WalletInfo = ({ walletAddress, onDisconnect }) => {
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-info">
      <div className="wallet-address2">
        <span className="wallet-icon">👛</span>
        {formatAddress(walletAddress)}
      </div>
      <button onClick={onDisconnect} className="disconnect-btn">
        Disconnect
      </button>
    </div>
  );
};

export default WalletInfo; 