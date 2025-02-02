export const formatBalance = (balance) => {
  if (typeof balance !== 'number') {
    return '0';
  }
  
  // Format to 2 decimal places
  return balance.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export default {
  formatBalance,
  formatTime
}; 