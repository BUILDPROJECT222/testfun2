import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  createTransferCheckedInstruction, 
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import bs58 from 'bs58';

const app = express();

app.use(cors({
  origin: [
    'https://farmfunsol.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/leaderboard', async (req, res) => {
  // Leaderboard logic
});

app.post('/api/harvest', async (req, res) => {
  // Harvest logic
});

// For Vercel, export the Express app
export default app; 