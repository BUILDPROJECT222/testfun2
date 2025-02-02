import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GardenPlot = ({ plot, onPlant, onHarvest }) => {
  const navigate = useNavigate();

  // Synchronize with plot data from localStorage if exists
  useEffect(() => {
    const savedPlots = localStorage.getItem('gardenPlots');
    if (savedPlots) {
      const plots = JSON.parse(savedPlots);
      const savedPlot = plots.find(p => p.id === plot.id);
      if (savedPlot) {
        // Update plot with saved data
        if (savedPlot.isPlanted !== plot.isPlanted || 
            savedPlot.progress !== plot.progress) {
          onPlant(plot.id, savedPlot.progress, savedPlot.isPlanted);
        }
      }
    }
  }, [plot.id, onPlant]);

  const getPlantSymbol = (progress) => {
    if (!plot.isPlanted) return ''; // Empty soil
    if (progress < 25) {
      return '🌱'; // Seed stage
    } else if (progress < 50) {
      return '🌿'; // Sprout stage
    } else if (progress < 75) {
      return '🎋'; // Growing stage
    } else if (progress < 100) {
      return '🌳'; // Mature stage
    } else {
      return '🌲'; // Harvest stage
    }
  };

  const getPlantStage = (progress) => {
    if (!plot.isPlanted) return 'Empty Plot';
    if (progress < 25) {
      return 'Seed Stage';
    } else if (progress < 50) {
      return 'Sprout Stage';
    } else if (progress < 75) {
      return 'Growing Stage';
    } else if (progress < 100) {
      return 'Mature Stage';
    } else {
      return 'Ready to Harvest';
    }
  };

  const handlePlotClick = () => {
    if (!plot.isPlanted) {
      navigate('/garden-area');
    }
  };

  const plantSymbol = getPlantSymbol(plot.progress);
  const plantStage = getPlantStage(plot.progress);

  return (
    <div className="garden-plot" onClick={handlePlotClick}>
      <div className="stage-indicator">{plantStage}</div>
      <div className="plot-status">Plot {plot.id}</div>
      
      <div className="plant-symbol">{plantSymbol}</div>
      
      {plot.isPlanted && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${plot.progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{plot.progress}% Growth</div>
        </div>
      )}

      {!plot.isPlanted ? (
        <button 
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/garden-area');
          }}
        >
          Plant
        </button>
      ) : plot.progress >= 100 ? (
        <button 
          className="action-button harvest-ready"
          onClick={(e) => {
            e.stopPropagation();
            onHarvest(plot.id);
          }}
        >
          Harvest
        </button>
      ) : (
        <button 
          className="action-button" 
          disabled
        >
          Growing...
        </button>
      )}
    </div>
  );
};

export default GardenPlot; 