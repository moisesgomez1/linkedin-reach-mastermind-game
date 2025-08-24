import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { sequelize } from './config/db';
import './models';

const app = express();
const PORT = process.env.PORT || 3000;

import { createGameSecret } from './services/gameService';
import { evaluateGuess } from './utils/gameLogic';

import gameRoutes from './routes/gameRoutes';

app.use(
    cors({
        origin: 'http://localhost:8080',
        credentials: true,
    })
);

app.use(cookieParser());

app.use(express.json());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

//Route Handler
app.use('/api', gameRoutes);

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
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Fallback: serve index.html for catch all route. Using regex because v5 doesnt allow for a * wildcard. Interesting.
app.get(/.*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

/**
 * Global error-handling middleware.
 * Catches any errors passed with next(err) and sends a structured JSON response.
 * Logs the full error stack to the server console, but hides it from the client.
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err.stack);

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// Start server and sync database
sequelize
    .sync({ alter: true }) //using force true for dev.
    .then(() => {
        console.log('Database synced!');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(' Database sync failed:', error);
    });
