import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  totalHarvests: {
    type: Number,
    default: 0
  },
  totalRewards: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard; 