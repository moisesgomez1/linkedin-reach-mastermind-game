require('dotenv').config();
import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

import { createGameSecret } from './services/gameService';
import { evaluateGuess } from './utils/gameLogic';

app.use(express.json());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/test-game', async (_req, res) => {
    const secret = await createGameSecret();
    res.status(200).json({ secret });
});

app.post('/test-guess', (req, res) => {
    const { secret, guess } = req.body;

    if (!Array.isArray(secret) || !Array.isArray(guess)) {
        return res.status(400).json({ error: 'Both secret and guess must be arrays of numbers' });
    }

    const result = evaluateGuess(secret, guess);
    return res.status(200).json({ result });
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
