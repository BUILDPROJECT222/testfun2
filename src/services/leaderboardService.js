const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const fetchLeaderboardData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const updateLeaderboard = async (walletAddress, harvestAmount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        harvestAmount,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update leaderboard');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
}; 