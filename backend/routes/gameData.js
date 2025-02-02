const express = require('express');
const router = express.Router();
const GameData = require('../models/GameData');

// Get game data
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    console.log('Fetching data for wallet:', walletAddress);

    let gameData = await GameData.findOne({ walletAddress });

    if (!gameData) {
      // Initialize new game data
      gameData = new GameData({
        walletAddress,
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
        lastUpdated: new Date()
      });
      await gameData.save();
      console.log('Created new game data for wallet:', walletAddress);
    }

    res.json(gameData);
  } catch (error) {
    console.error('Error in GET /game-data/:walletAddress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch game data',
      details: error.message 
    });
  }
});

// Save game data
router.post('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { plots, userSeeds } = req.body;

    console.log('Saving data for wallet:', walletAddress);
    console.log('Plots:', plots);
    console.log('Seeds:', userSeeds);

    // Validate input data
    if (!Array.isArray(plots)) {
      throw new Error('Plots must be an array');
    }

    if (typeof userSeeds !== 'object') {
      throw new Error('UserSeeds must be an object');
    }

    // Format the data correctly for MongoDB
    const formattedPlots = plots.map(plot => ({
      id: plot.id,
      planted: Boolean(plot.planted),
      plantType: plot.plantType,
      growthStage: Number(plot.growthStage) || 0,
      isWatered: Boolean(plot.isWatered),
      plantedAt: plot.plantedAt ? new Date(plot.plantedAt) : null,
      readyToHarvest: Boolean(plot.readyToHarvest)
    }));

    // Update or create game data
    const gameData = await GameData.findOneAndUpdate(
      { walletAddress },
      { 
        plots: formattedPlots, 
        userSeeds,
        lastUpdated: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    console.log('Successfully saved game data:', gameData);
    res.json(gameData);

  } catch (error) {
    console.error('Error in POST /game-data/:walletAddress:', error);
    res.status(500).json({ 
      error: 'Failed to save game data',
      details: error.message 
    });
  }
});

module.exports = router; 