const Plot = ({ 
  index, 
  plot, 
  plots, 
  setPlots, 
  selectedTool, 
  selectedSeed,
  userSeeds,
  setUserSeeds,
  walletAddress 
}) => {
  // ... existing code ...

  const savePlotData = async (newPlots, newUserSeeds) => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`http://localhost:5000/api/plots/${walletAddress}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plots: newPlots,
          userSeeds: newUserSeeds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save plot data');
      }

      console.log('Plot data saved successfully');
    } catch (error) {
      console.error('Error saving plot:', error);
      toast.error('Failed to save plot data');
    }
  };

  const handlePlantSeed = async () => {
    if (!selectedSeed) return;

    try {
      const newPlots = [...plots];
      newPlots[index] = {
        ...plot,
        planted: true,
        plantType: selectedSeed,
        growthStage: 0,
        plantedAt: new Date(),
        isWatered: false,
        readyToHarvest: false
      };

      const newUserSeeds = {
        ...userSeeds,
        [selectedSeed]: Math.max(0, (userSeeds[selectedSeed] || 0) - 1)
      };

      setPlots(newPlots);
      setUserSeeds(newUserSeeds);
      await savePlotData(newPlots, newUserSeeds);

      toast.success('Seed planted successfully!');
    } catch (error) {
      console.error('Error planting seed:', error);
      toast.error('Failed to plant seed');
    }
  };

  // ... rest of the component code ...
};

export default Plot; 