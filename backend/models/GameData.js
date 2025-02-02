const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  id: Number,
  planted: {
    type: Boolean,
    default: false
  },
  plantType: String,
  growthStage: {
    type: Number,
    default: 0
  },
  isWatered: {
    type: Boolean,
    default: false
  },
  plantedAt: Date,
  readyToHarvest: {
    type: Boolean,
    default: false
  }
});

const gameDataSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  plots: [plotSchema],
  userSeeds: {
    type: Map,
    of: Number,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Add middleware to handle conversion between Map and Object
gameDataSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.userSeeds instanceof Map) {
      ret.userSeeds = Object.fromEntries(ret.userSeeds);
    }
    return ret;
  }
});

module.exports = mongoose.model('GameData', gameDataSchema); 