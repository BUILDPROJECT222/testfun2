import React, { useEffect, useState } from 'react';
import Plot from '../Plot/Plot';
import './GardenArea.css';
import { toast } from 'react-toastify';

const GardenArea = ({ 
  plots, 
  setPlots, 
  selectedTool, 
  selectedSeed,
  userSeeds,
  setUserSeeds,
  walletAddress 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Load plots data when component mounts
  useEffect(() => {
    const loadPlotsData = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/plots/${walletAddress}`);
        if (!response.ok) {
          throw new Error('Failed to load garden data');
        }

        const data = await response.json();
        console.log('Loaded garden data:', data);

        if (data.plots && data.plots.length > 0) {
          setPlots(data.plots.map(plot => ({
            ...plot,
            plantedAt: plot.plantedAt ? new Date(plot.plantedAt) : null
          })));
        }

        if (data.userSeeds) {
          setUserSeeds(data.userSeeds);
        }

      } catch (error) {
        console.error('Error loading garden:', error);
        toast.error('Failed to load garden data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlotsData();
  }, [walletAddress, setPlots, setUserSeeds]);

  // Save plots data whenever it changes
  useEffect(() => {
    const savePlotsData = async () => {
      if (!walletAddress || isLoading) return;

      try {
        const response = await fetch(`http://localhost:5000/api/plots/${walletAddress}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plots,
            userSeeds
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save garden data');
        }

        console.log('Garden data saved successfully');
      } catch (error) {
        console.error('Error saving garden:', error);
        toast.error('Failed to save garden data');
      }
    };

    savePlotsData();
  }, [plots, userSeeds, walletAddress, isLoading]);

  if (isLoading) {
    return (
      <div className="garden-area loading">
        <div className="loading-spinner">🌱</div>
        <p>Loading your garden...</p>
      </div>
    );
  }

  return (
    <div className="garden-area">
      {plots.map((plot, index) => (
        <Plot
          key={index}
          index={index}
          plot={plot}
          plots={plots}
          setPlots={setPlots}
          selectedTool={selectedTool}
          selectedSeed={selectedSeed}
          userSeeds={userSeeds}
          setUserSeeds={setUserSeeds}
          walletAddress={walletAddress}
        />
      ))}
    </div>
  );
};

export default GardenArea; 