require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection Options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Test route (before MongoDB connection)
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Connect to MongoDB
console.log('Connecting to MongoDB...'); // Debug log
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    
    // Start server only after successful MongoDB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

// MongoDB Schema
const GameDataSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  gameData: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// Add Leaderboard Schema
const LeaderboardSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  totalHarvests: { type: Number, default: 0 },
  totalRewards: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const GameData = mongoose.model('GameData', GameDataSchema);
const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

// Game data routes
app.post('/api/game-data/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const gameData = req.body;
    console.log('Received request:', { walletAddress, gameData }); // Debug log

    const result = await GameData.findOneAndUpdate(
      { walletAddress },
      { gameData, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    console.log('Saved result:', result); // Debug log
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Save error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/game-data/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const userData = await GameData.findOne({ walletAddress });
    res.json(userData ? userData.gameData : null);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add Leaderboard routes
app.get('/api/leaderboard', async (req, res) => {
  try {
    console.log('Fetching leaderboard data...'); // Debug log
    const leaderboardData = await Leaderboard.find()
      .sort({ totalRewards: -1 })
      .limit(10);
    console.log('Leaderboard data:', leaderboardData); // Debug log
    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update leaderboard data when harvesting
app.post('/api/leaderboard/update', async (req, res) => {
  try {
    const { walletAddress, harvestAmount } = req.body;
    
    const result = await Leaderboard.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { 
          totalHarvests: 1,
          totalRewards: harvestAmount
        },
        lastUpdated: Date.now()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Leaderboard update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add harvest endpoint
app.post('/api/harvest', async (req, res) => {
  try {
    const { walletAddress, plotIndex, plantType, reward } = req.body;
    
    // Update leaderboard data
    await Leaderboard.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { 
          totalHarvests: 1,
          totalRewards: reward
        },
        lastUpdated: Date.now()
      },
      { upsert: true, new: true }
    );

    // Update game data to clear the harvested plot
    await GameData.findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          [`gameData.plots.${plotIndex}`]: {
            id: plotIndex,
            planted: false,
            plantType: null,
            growthStage: 0,
            isWatered: false,
            plantedAt: null,
            readyToHarvest: false
          }
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Harvest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
}); 