import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/game-data';

export const gameService = {
  // Load game data from backend
  async loadGameData(walletAddress) {
    if (!walletAddress) return null;

    try {
      // Load from localStorage first
      const cachedData = localStorage.getItem(`gameData_${walletAddress}`);
      let localData = null;

      if (cachedData) {
        try {
          localData = JSON.parse(cachedData);
          // Convert dates back to Date objects
          if (localData.plots) {
            localData.plots = localData.plots.map(plot => ({
              ...plot,
              plantedAt: plot.plantedAt ? new Date(plot.plantedAt) : null
            }));
          }
          console.log('Loaded from localStorage:', localData);
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
        }
      }

      // Try to fetch from server
      try {
        const response = await fetch(`${API_URL}/${walletAddress}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (response.ok) {
          const serverData = await response.json();
          console.log('Loaded from server:', serverData);
          
          // Convert dates for server data
          if (serverData.plots) {
            serverData.plots = serverData.plots.map(plot => ({
              ...plot,
              plantedAt: plot.plantedAt ? new Date(plot.plantedAt) : null
            }));
          }

          // Use server data if it's newer
          if (!localData || new Date(serverData.lastUpdated) > new Date(localData.lastUpdated)) {
            localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(serverData));
            return serverData;
          }
        }
      } catch (serverError) {
        console.warn('Server fetch failed:', serverError);
      }

      // Return cached data if we have it
      if (localData) {
        return localData;
      }

      // Initialize new data if nothing exists
      const newData = {
        plots: Array(20).fill().map((_, index) => ({
          id: index,
          planted: false,
          plantType: null,
          growthStage: 0,
          isWatered: false,
          plantedAt: null,
          readyToHarvest: false
        })),
        userSeeds: {},
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(newData));
      return newData;

    } catch (error) {
      console.error('Error in loadGameData:', error);
      throw error;
    }
  },

  // Save game data to backend
  async saveGameData(walletAddress, plots, userSeeds) {
    if (!walletAddress) return null;

    const gameData = {
      plots: plots.map(plot => ({
        ...plot,
        plantedAt: plot.plantedAt ? plot.plantedAt.toISOString() : null
      })),
      userSeeds,
      lastUpdated: new Date().toISOString()
    };

    // Save to localStorage immediately
    try {
      localStorage.setItem(`gameData_${walletAddress}`, JSON.stringify(gameData));
      console.log('Saved to localStorage:', gameData);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    // Try to save to server
    try {
      const response = await fetch(`${API_URL}/${walletAddress}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(gameData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const savedData = await response.json();
      console.log('Saved to server:', savedData);
      return savedData;
    } catch (error) {
      console.warn('Server save failed, using localStorage:', error);
      return gameData; // Return local data even if server save fails
    }
  },

  // Initialize new game data
  async initializeGameData(walletAddress) {
    const newPlots = Array(20).fill().map((_, index) => ({
      id: index,
      planted: false,
      plantType: null,
      growthStage: 0,
      isWatered: false,
      plantedAt: null,
      readyToHarvest: false
    }));

    const initialData = {
      plots: newPlots,
      userSeeds: {},
      lastUpdated: new Date()
    };

    try {
      await this.saveGameData(walletAddress, newPlots, {});
      return initialData;
    } catch (error) {
      console.error('Error initializing game data:', error);
      return initialData;
    }
  },

  // Add method to force sync with localStorage
  async syncWithLocalStorage(walletAddress) {
    if (!walletAddress) return;

    const cachedData = localStorage.getItem(`gameData_${walletAddress}`);
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        return data;
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
      }
    }
    return null;
  }
}; 