const API_BASE_URL = 'http://localhost:5000/api';

export const saveUserDataToServer = async (walletAddress, data) => {
  try {
    console.log('Saving data for wallet:', walletAddress, data); // Debug log

    const response = await fetch(`${API_BASE_URL}/game-data/${walletAddress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Server response:', responseData); // Debug log
    return responseData;
  } catch (error) {
    console.error('Error saving data to server:', error);
    throw error;
  }
};

export const loadUserDataFromServer = async (walletAddress) => {
  try {
    console.log('Loading data for wallet:', walletAddress); // Debug log

    const response = await fetch(`${API_BASE_URL}/game-data/${walletAddress}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Loaded data from server:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error loading data from server:', error);
    throw error;
  }
}; 