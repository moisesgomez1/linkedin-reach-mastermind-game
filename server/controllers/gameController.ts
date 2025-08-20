import { Request, Response, NextFunction } from 'express';
import { createGameSecret } from 'server/services/gameService';
import Game from '../models/Game';

export const startGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch secret code from Random.org
        const secret = await createGameSecret();

        // Create a new Game record in the database
        const newGame = await Game.create({
            secret,
            attemptsLeft: 10,
        });

        // Return game ID to client (client will store this for subsequent requests)
        res.status(201).json({
            gameId: newGame.id,
            message: 'New game started. You have 10 attempts to guess the code.',
        });
    } catch (error) {
        console.error('Error starting game:', error);
        next(error);
    }
};
