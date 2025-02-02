import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WalletConnection.css';

const WalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPhantomWallet = async () => {
      try {
        const isPhantomAvailable = window?.solana?.isPhantom;
        setIsPhantomInstalled(isPhantomAvailable);

        // Check if we're already connected
        if (isPhantomAvailable) {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        }
      } catch (error) {
        console.error('Wallet check error:', error);
      }
    };

    checkPhantomWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (!isPhantomInstalled) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await window.solana.connect();
      const pubKey = response.publicKey.toString();
      setWalletAddress(pubKey);
      
      // Save wallet address to localStorage
      localStorage.setItem('walletAddress', pubKey);
      
      // Redirect to Join page after successful connection
      navigate('/join');
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setWalletAddress(null);
      localStorage.removeItem('walletAddress');
      navigate('/');
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  return (
    <div className="wallet-connection">
      {!walletAddress ? (
        <button 
          className="connect-wallet-btn"
          onClick={connectWallet}
        >
          {isPhantomInstalled ? 'Connect Wallet' : 'Install Phantom'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <button 
            className="disconnect-wallet-btn"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection; 