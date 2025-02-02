import { saveUserDataToServer, loadUserDataFromServer } from './apiService';

export const saveUserData = async (walletAddress, data) => {
  try {
    if (!walletAddress) return;
    
    // Format data yang akan disimpan
    const dataToSave = {
      seeds: data.seeds || {},
      plots: data.plots || [],
      lastUpdated: new Date().toISOString()
    };
    
    // Simpan ke localStorage sebagai backup
    const key = `farm_data_${walletAddress}`;
    localStorage.setItem(key, JSON.stringify(dataToSave));
    
    // Simpan ke server
    await saveUserDataToServer(walletAddress, dataToSave);
    console.log('Data saved successfully:', dataToSave);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const loadUserData = async (walletAddress) => {
  try {
    if (!walletAddress) return null;
    
    // Coba ambil data dari server dulu
    try {
      const serverData = await loadUserDataFromServer(walletAddress);
      if (serverData && serverData.data && serverData.data.gameData) {
        const { seeds, plots } = serverData.data.gameData;
        return {
          seeds: seeds || {},
          plots: plots || []
        };
      }
    } catch (serverError) {
      console.error('Server load failed, trying localStorage:', serverError);
    }
    
    // Fallback ke localStorage jika server gagal
    const key = `farm_data_${walletAddress}`;
    const localData = localStorage.getItem(key);
    if (localData) {
      const parsed = JSON.parse(localData);
      return {
        seeds: parsed.seeds || {},
        plots: parsed.plots || []
      };
    }
    
    // Jika tidak ada data sama sekali, kembalikan state default
    return {
      seeds: {},
      plots: Array(20).fill().map((_, index) => ({ 
        id: index,
        planted: false,
        plantType: null,
        growthStage: 0,
        isWatered: false,
        plantedAt: null,
        readyToHarvest: false
      }))
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

export const clearUserData = (walletAddress) => {
  try {
    if (!walletAddress) return;
    
    const key = `farm_data_${walletAddress}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}; 