const express = require('express');
const router = express.Router();
const Plot = require('../models/Plot');

// Get plots for wallet
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    let plotData = await Plot.findOne({ walletAddress });
    
    if (!plotData) {
      plotData = new Plot({ 
        walletAddress,
        plots: [],
        userSeeds: {}
      });
      await plotData.save();
    }
    
    res.json(plotData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save plots for wallet
router.post('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { plots, userSeeds } = req.body;
    
    const plotData = await Plot.findOneAndUpdate(
      { walletAddress },
      { plots, userSeeds },
      { new: true, upsert: true }
    );
    
    res.json(plotData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 