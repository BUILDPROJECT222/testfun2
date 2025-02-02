import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { gameService } from '../services/gameService';
import { toast } from 'react-toastify';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [plots, setPlots] = useState([]);
  const [userSeeds, setUserSeeds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useWallet();

  // Load data when wallet connects
  const loadGameData = useCallback(async () => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Try to load from localStorage first
      const cachedData = localStorage.getItem(`gameData_${walletAddress}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setPlots(parsedData.plots || []);
        setUserSeeds(parsedData.userSeeds || {});
      }

      // Then load from server
      const serverData = await gameService.loadGameData(walletAddress);
      if (serverData) {
        setPlots(serverData.plots || []);
        setUserSeeds(serverData.userSeeds || {});
        // Update localStorage with server data
        localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(serverData));
      }
    } catch (error) {
      console.error('Error loading game data:', error);
      toast.error('Failed to load your game data');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  // Save data whenever it changes
  const saveGameData = useCallback(async () => {
    if (!walletAddress || isLoading) return;

    try {
      const gameData = {
        plots,
        userSeeds,
        lastUpdated: new Date().toISOString()
      };

      // Save to localStorage immediately
      localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(gameData));

      // Save to server
      await gameService.saveGameData(walletAddress, plots, userSeeds);
    } catch (error) {
      console.error('Error saving game data:', error);
      toast.error('Failed to save your game data');
    }
  }, [walletAddress, plots, userSeeds, isLoading]);

  // Save data when it changes
  useEffect(() => {
    if (!walletAddress || isLoading) return;
    
    const timeoutId = setTimeout(saveGameData, 1000);
    return () => clearTimeout(timeoutId);
  }, [walletAddress, plots, userSeeds, isLoading, saveGameData]);

  // Save data before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (walletAddress) {
        const gameData = {
          plots,
          userSeeds,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(gameData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [walletAddress, plots, userSeeds]);

  const updatePlots = useCallback(async (newPlots) => {
    try {
      setPlots(newPlots);
      if (walletAddress) {
        const gameData = {
          plots: newPlots,
          userSeeds,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(gameData));
        await gameService.saveGameData(walletAddress, newPlots, userSeeds);
      }
    } catch (error) {
      console.error('Error updating plots:', error);
      toast.error('Failed to update your garden');
    }
  }, [walletAddress, userSeeds]);

  const updateSeeds = useCallback(async (newSeeds) => {
    try {
      setUserSeeds(newSeeds);
      if (walletAddress) {
        const gameData = {
          plots,
          userSeeds: newSeeds,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(gameData));
        await gameService.saveGameData(walletAddress, plots, newSeeds);
      }
    } catch (error) {
      console.error('Error updating seeds:', error);
      toast.error('Failed to update your seeds');
    }
  }, [walletAddress, plots]);

  return (
    <GameContext.Provider value={{
      plots,
      userSeeds,
      isLoading,
      updatePlots,
      updateSeeds,
      loadGameData // Export loadGameData for manual refresh if needed
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}; 