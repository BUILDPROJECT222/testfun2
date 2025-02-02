import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { 
  createTransferCheckedInstruction, 
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env file from the same directory as server.js
dotenv.config({ path: path.join(__dirname, '.env') });

// Add validation logging
console.log('Environment variables loaded:');
console.log('TOKEN_MINT:', process.env.REACT_APP_TOKEN_MINT);
console.log('DEVNET_RPC_URL:', process.env.REACT_APP_DEVNET_RPC_URL);

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Frontend port
  credentials: true
}));

app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

// Constants
const DEVNET_RPC_URL = process.env.REACT_APP_DEVNET_RPC_URL;
// Add validation before creating PublicKey
if (!process.env.REACT_APP_TOKEN_MINT) {
    console.error('REACT_APP_TOKEN_MINT is not set in environment variables');
    process.exit(1);
}
const TOKEN_MINT = new PublicKey(process.env.REACT_APP_TOKEN_MINT.trim());
const TOKEN_DECIMALS = parseInt(process.env.REACT_APP_TOKEN_DECIMALS);
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Initialize leaderboard data structure
let leaderboardData = new Map();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('=== MongoDB Connection Status ===');
  console.log('Connected to MongoDB Successfully');
  console.log('Database URI:', process.env.MONGODB_URI);
  
  // Test query to verify database access
  return Leaderboard.find().limit(1);
})
.then(testData => {
  console.log('Database test query successful');
  console.log('Current leaderboard entries:', testData.length);
})
.catch(err => {
  console.error('MongoDB Connection/Query Error:', err);
  process.exit(1);
});

// Define Leaderboard Schema
const LeaderboardSchema = new mongoose.Schema({
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
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

// Add more detailed logging to updateLeaderboard function
const updateLeaderboard = async (walletAddress, harvestAmount) => {
  try {
    console.log('=== Updating Leaderboard ===');
    console.log('Wallet:', walletAddress);
    console.log('Harvest Amount:', harvestAmount);

    const result = await Leaderboard.findOneAndUpdate(
      { walletAddress },
      { 
        $inc: { 
          totalHarvests: 1,
          totalRewards: harvestAmount 
        },
        lastUpdated: Date.now()
      },
      { 
        upsert: true, 
        new: true 
      }
    );
    
    console.log('Leaderboard update successful');
    console.log('Updated record:', result);
    return result;
  } catch (error) {
    console.error('Error updating leaderboard in database:', error);
    throw error;
  }
};

// Validate environment variables
if (!process.env.STORE_WALLET_PRIVATE_KEY) {
  console.error('STORE_WALLET_PRIVATE_KEY is not set in environment variables');
  process.exit(1);
}

let storeWalletKeypair;
try {
  const privateKeyString = process.env.STORE_WALLET_PRIVATE_KEY;
  const privateKeyBytes = bs58.decode(privateKeyString);
  storeWalletKeypair = Keypair.fromSecretKey(privateKeyBytes);
  console.log('Store wallet loaded successfully:', storeWalletKeypair.publicKey.toString());
} catch (error) {
  console.error('Failed to load store wallet:', error);
  process.exit(1);
}

// Add this function after the imports and before the routes
const getConnection = () => {
  return new Connection(DEVNET_RPC_URL, {
    commitment: 'confirmed',
    wsEndpoint: undefined,
    confirmTransactionInitialTimeout: 60000
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Update leaderboard endpoint with more logging
app.get('/api/leaderboard', async (req, res) => {
  try {
    console.log('=== Fetching Leaderboard Data ===');
    console.log('Querying MongoDB...');
    
    const data = await Leaderboard.find()
      .sort({ totalRewards: -1 })
      .limit(10);
    
    console.log('Found', data.length, 'leaderboard entries');
    console.log('Leaderboard data:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Database error when fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard data'
    });
  }
});

// Harvest endpoint
app.post('/api/harvest', async (req, res) => {
  console.log('=== START HARVEST REQUEST ===');
  console.log('Received harvest request:', req.body);
  
  try {
    const { walletAddress, plotIndex, plantType, reward } = req.body;

    // Validate input
    if (!walletAddress || !plantType || !reward) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Update leaderboard with this harvest using MongoDB
    await updateLeaderboard(walletAddress, reward);

    console.log('Creating connection...');
    const connection = getConnection();
    const recipientWallet = new PublicKey(walletAddress);
    
    console.log('Getting token accounts...');
    // Get token accounts
    const recipientTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      recipientWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const storeTokenAccount = await getAssociatedTokenAddress(
      TOKEN_MINT,
      storeWalletKeypair.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('Token accounts:', {
      recipient: recipientTokenAccount.toString(),
      store: storeTokenAccount.toString()
    });

    // Check store token balance
    const storeAccount = await getAccount(connection, storeTokenAccount);
    console.log('Store token balance:', storeAccount.amount.toString());

    // Create transaction
    console.log('Creating transaction...');
    const transaction = new Transaction();
    const rewardAmount = Math.floor(reward * Math.pow(10, TOKEN_DECIMALS));

    console.log('Adding transfer instruction...', {
      amount: rewardAmount,
      from: storeTokenAccount.toString(),
      to: recipientTokenAccount.toString()
    });

    // Add transfer instruction
    transaction.add(
      createTransferCheckedInstruction(
        storeTokenAccount,
        TOKEN_MINT,
        recipientTokenAccount,
        storeWalletKeypair.publicKey,
        rewardAmount,
        TOKEN_DECIMALS,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Get latest blockhash
    console.log('Getting latest blockhash...');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = recipientWallet;

    console.log('Signing transaction with store wallet...');
    // Partially sign with store wallet
    transaction.partialSign(storeWalletKeypair);

    console.log('Serializing transaction...');
    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false
    }).toString('base64');

    console.log('Transaction ready for client signing');
    res.json({
      success: true,
      transaction: serializedTransaction,
      message: 'Transaction created successfully',
      debug: {
        rewardAmount,
        recipientAccount: recipientTokenAccount.toString(),
        storeAccount: storeTokenAccount.toString(),
        blockhash
      }
    });

  } catch (error) {
    console.error('Harvest error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
  console.log('=== END HARVEST REQUEST ===');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});