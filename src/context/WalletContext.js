import React, { createContext, useState, useContext, useEffect } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, getMint } from '@solana/spl-token';

const WalletContext = createContext();

// Update RPC URL constant
const DEVNET_RPC_URL = process.env.REACT_APP_DEVNET_RPC_URL;

const getConnection = () => {
  return new Connection(DEVNET_RPC_URL, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
};

// Update Token constants
const TOKEN_MINT = new PublicKey(process.env.REACT_APP_TOKEN_MINT);
const DECIMALS = parseInt(process.env.REACT_APP_TOKEN_DECIMALS);

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

  const shortenAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const showWalletNotification = (message, isError = false) => {
    if (notificationVisible) return;
    
    setNotificationVisible(true);
    setNotification({ message, isError });
    
    setTimeout(() => {
      setNotification(null);
      setNotificationVisible(false);
    }, 3000);
  };

  const checkTokenBalance = async (publicKey) => {
    try {
      const connection = getConnection();
      
      // Get associated token account
      const associatedTokenAddress = await getAssociatedTokenAddress(
        TOKEN_MINT,
        publicKey
      );

      console.log('Checking token account:', associatedTokenAddress.toString());

      try {
        // Get token account info
        const tokenAccount = await getAccount(connection, associatedTokenAddress);
        const mintInfo = await getMint(connection, TOKEN_MINT);
        
        // Calculate actual balance
        const balance = Number(tokenAccount.amount) / Math.pow(10, mintInfo.decimals);
        console.log('Token balance:', balance);
        setTokenBalance(balance);
        return balance;
      } catch (e) {
        console.log('No token account found:', e);
        setTokenBalance(0);
        return 0;
      }
    } catch (error) {
      console.error('Error checking token balance:', error);
      setTokenBalance(0);
      return 0;
    }
  };

  const checkWalletConnection = async () => {
    try {
      const { solana } = window;
      
      if (!solana?.isPhantom) {
        return false;
      }

      const connected = solana.isConnected;
      if (connected) {
        const publicKey = solana.publicKey;
        const address = publicKey.toString();
        setWalletAddress(shortenAddress(address));
        
        // Check token balance when wallet is connected
        await checkTokenBalance(publicKey);
      }
      setIsWalletConnected(connected);
      return connected;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window;

      if (solana?.isPhantom) {
        const response = await solana.connect();
        const pubKey = response.publicKey.toString();
        
        // Use devnet connection
        const connection = new Connection(DEVNET_RPC_URL, {
          commitment: 'confirmed',
          wsEndpoint: undefined,
          confirmTransactionInitialTimeout: 60000
        });

        setWalletAddress(pubKey);
        setIsWalletConnected(true);
        
        setNotification({
          message: 'Wallet connected successfully!',
          isError: false
        });
      } else {
        setNotification({
          message: 'Phantom wallet is not installed',
          isError: true
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setNotification({
        message: `Failed to connect wallet: ${error.message}`,
        isError: true
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      const { solana } = window;
      if (solana) {
        await solana.disconnect();
        setIsWalletConnected(false);
        setWalletAddress('');
        setTokenBalance(0);
        
        if (!notificationVisible) {
          showWalletNotification('Wallet disconnected');
        }
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      if (!notificationVisible) {
        showWalletNotification('Failed to disconnect wallet', true);
      }
    }
  };

  // Add network check on component mount
  useEffect(() => {
    const checkAndSwitchNetwork = async () => {
      const { solana } = window;
      if (solana?.isPhantom && isWalletConnected) {
        try {
          // Check current network
          const resp = await solana.request({
            method: 'wallet_getNetwork'
          });
          
          // If not on devnet, switch to it
          if (resp !== 'devnet') {
            await solana.request({
              method: 'wallet_switchNetwork',
              params: [{ networkName: 'devnet' }],
            });
            console.log('Switched to devnet');
          }
        } catch (error) {
          console.error('Network switch error:', error);
          setNotification({
            message: 'Please switch to Devnet in your Phantom wallet',
            isError: true
          });
        }
      }
    };

    checkAndSwitchNetwork();
  }, [isWalletConnected]);

  useEffect(() => {
    checkWalletConnection();

    // Add listener for wallet connection changes
    const { solana } = window;
    if (solana) {
      solana.on('connect', async () => {
        console.log('Wallet connected event');
        await checkWalletConnection();
      });

      solana.on('disconnect', () => {
        console.log('Wallet disconnected event');
        setIsWalletConnected(false);
        setWalletAddress('');
        setTokenBalance(0);
      });

      solana.on('accountChanged', async () => {
        console.log('Wallet account changed event');
        await checkWalletConnection();
      });
    }

    return () => {
      if (solana) {
        solana.removeAllListeners('connect');
        solana.removeAllListeners('disconnect');
        solana.removeAllListeners('accountChanged');
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      isWalletConnected: !!walletAddress,
      connectWallet,
      disconnectWallet,
      showWalletNotification,
      tokenBalance,
      checkTokenBalance,
      TOKEN_MINT,
      DECIMALS
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 