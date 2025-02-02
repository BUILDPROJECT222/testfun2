const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  plots: [{
    id: Number,
    planted: Boolean,
    plantType: String,
    growthStage: Number,
    isWatered: Boolean,
    plantedAt: Date,
    readyToHarvest: Boolean
  }],
  userSeeds: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Plot', plotSchema); 