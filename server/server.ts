require('dotenv').config();
import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

import { fetchRandomNumbers } from './services/randomService';

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/test-random', async (_req: Request, res: Response) => {
  try {
    const numbers = await fetchRandomNumbers();
    res.status(200).json({ randomNumbers: numbers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random numbers' });
  }
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback: serve index.html for catch all route. Using regex because v5 doesnt allow for a * wildcard. Interesting.
app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
