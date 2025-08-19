require('dotenv').config();
import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

import { createGameSecret } from './services/gameService';

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/test-game', async (_req, res) => {
  const secret = await createGameSecret();
  res.status(200).json({ secret });
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
