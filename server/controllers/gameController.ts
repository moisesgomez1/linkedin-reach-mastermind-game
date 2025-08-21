import { Request, Response, NextFunction } from 'express';
import { createGameSecret } from '../services/gameService';
import { evaluateGuess } from '../utils/gameLogic';
import Game from '../models/Game';

/**
 * Middleware to fetch a secret from Random.org or a fallback.
 *
 * If the secret is valid, it is attached to `res.locals.secret`.
 * If the secret is invalid or an error occurs, a 502 response is sent or the error is passed to the next handler.
 *
 * @async
 * @param {Request} _req - The incoming request (not used).
 * @param {Response} res - The HTTP response object; used to attach the secret and send errors.
 * @param {NextFunction} next - Callback to pass control to the next middleware.
 */
export async function fetchSecret(_req: Request, res: Response, next: NextFunction) {
    try {
        const secret = await createGameSecret();
        if (!Array.isArray(secret) || secret.length !== 4) {
            return res.status(502).json({ error: 'Failed to generate a valid secret.' });
        }
        res.locals.secret = secret;
        next();
    } catch (err) {
        next(err);
    }
}

/**
 * Middleware to initialize a new game session.
 *
 * Uses the secret stored in `res.locals.secret` to create a new `Game` record in the database.
 * The newly created game instance is attached to `res.locals.game`.
 *
 * If an error occurs during database interaction, it is passed to the error-handling middleware.
 *
 * @async
 * @param {Request} req - The HTTP request object (not used).
 * @param {Response} res - The HTTP response object; used to access `res.locals.secret` and attach the created game.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 */
export const startGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get secret from res.locals
        const secret: number[] = res.locals.secret;

        // Create a new Game record in the database
        const newGame = await Game.create({
            secret,
            attemptsLeft: 10,
        });
        res.locals.game = newGame;
        next();
    } catch (error) {
        console.error('Error starting game:', error);
        next(error);
    }
};

/**
 * Middleware to set a `gameId` cookie for the client.
 *
 * Retrieves the `game.id` value from `res.locals.game` and attaches it as a
 * cookie named `gameId`.
 *
 * This allows the client to persist its game session across requests.
 *
 * @param {Request} _req - The HTTP request object (not used).
 * @param {Response} res - The HTTP response object; used to set the cookie.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 */
export function setGameCookie(_req: Request, res: Response, next: NextFunction) {
    try {
        const gameId = res.locals.game.id as string;

        res.cookie('gameId', gameId, {
            httpOnly: true,
            secure: false, 
            sameSite: 'none', //will be strict in prod 
            maxAge: 1000 * 60 * 60 * 24,
            path: '/',
        });

        next();
    } catch (err) {
        next(err);
    }
}

export const makeGuess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //just for testing will pass in the game id through the request body, will later retrieve from either session cookie or token.
        const { gameId, guess } = req.body;

        // Validate guess format (array of 4 numbers for now)
        if (
            !Array.isArray(guess) ||
            guess.length !== 4 ||
            guess.some((n) => typeof n !== 'number')
        ) {
            return res
                .status(400)
                .json({ error: 'Invalid guess format. Must be an array of 4 numbers.' });
        }

        // Fetch game from db
        const game = await Game.findByPk(gameId);
        if (!game) return res.status(404).json({ error: 'Game not found.' });

        // Check if game is still active
        if (game.attemptsLeft <= 0) {
            return res.status(400).json({ error: 'No attempts remaining. Game over.' });
        }

        console.log('This is the game secret', game.secret);

        // Evaluate the guess with the util function we imported
        const { correctNumbers, correctPositions } = evaluateGuess(game.secret, guess);

        // Update attempts
        game.attemptsLeft -= 1;
        await game.save(); //db query

        return res.status(200).json({
            correctNumbers,
            correctPositions,
            attemptsLeft: game.attemptsLeft,
        });
    } catch (error) {
        next(error);
    }
};
