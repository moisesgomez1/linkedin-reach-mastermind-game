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
export async function startGame(req: Request, res: Response, next: NextFunction) {
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
}

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
            secure: false, // http
            sameSite: 'lax', // not 'none' on http
            path: '/',
            maxAge: 86400000,
        });

        next();
    } catch (err) {
        next(err);
    }
}

/**
 * Middleware to load a game from the database using the `gameId` cookie.
 *
 * - Retrieves the `gameId` value from the request cookies.
 * - Queries the database for a `Game` record with the given ID.
 * - If found, attaches both `gameId` and the `Game` instance to `res.locals`.
 * - If the cookie is missing or the game cannot be found, responds with an error.
 *
 * @async
 * @param {Request} req - The HTTP request object; used to access the `gameId` cookie.
 * @param {Response} res - The HTTP response object; used to attach the loaded game or send error responses.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 *
 * @returns {void} Sends a `400` response if the `gameId` cookie is missing,
 *                 or a `404` response if no game is found with that ID.
 *                 Otherwise, proceeds to the next middleware.
 */
export async function loadGame(req: Request, res: Response, next: NextFunction) {
    try {
        // getting the game id from the cookie.
        const gameId = req.cookies?.gameId;
        console.log('cookies:', req.cookies, 'gameId:', gameId);
        if (!gameId) {
            return res.status(400).json({ error: 'Missing gameId cookie.' });
        }

        // making a query to find the game by the uuid
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found.' });
        }

        res.locals.gameId = gameId;
        res.locals.game = game;
        next();
    } catch (err) {
        next(err);
    }
}

export async function makeGuess(req: Request, res: Response, next: NextFunction) {
    try {
        const { guess } = req.body;
        const { gameId } = res.locals;

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

        // Check for win condition
        if (correctPositions === 4) {
            game.isWin = true;
            game.isOver = true;
        } else if (game.attemptsLeft === 0) {
            game.isOver = true;
        }
        await game.save(); //db query

        return res.status(200).json({
            correctNumbers,
            correctPositions,
            attemptsLeft: game.attemptsLeft,
            isWin: game.isWin,
            isOver: game.isOver,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Middleware to validate the player's guess input.
 *
 * Ensures that the request body contains a `guess` field that meets all of the following:
 * - Must be an array.
 * - Must contain exactly 4 elements.
 * - Each element must be an integer.
 * - Each integer must be between 0 and 7 (inclusive).
 *
 * If validation fails, responds with a `400 Bad Request` and an appropriate error message.
 * If validation passes, the request continues to the next middleware.
 *
 * @param {Request} req - The HTTP request object; expected to contain `req.body.guess`.
 * @param {Response} res - The HTTP response object; used to send error responses when validation fails.
 * @param {NextFunction} next - Callback to pass control to the next middleware if validation succeeds.
 *
 * @returns {void} Sends a `400` response if validation fails; otherwise calls `next()`.
 */
export function validateGuessInput(req: Request, res: Response, next: NextFunction) {
    const { guess } = req.body;

    if (!Array.isArray(guess)) {
        return res.status(400).json({ error: 'guess must be an array.' });
    }
    if (guess.length !== 4) {
        return res.status(400).json({ error: 'guess must contain exactly 4 numbers.' });
    }
    if (guess.some((n) => typeof n !== 'number' || !Number.isInteger(n))) {
        return res.status(400).json({ error: 'guess must contain integers.' });
    }
    if (guess.some((n) => n < 0 || n > 7)) {
        return res.status(400).json({ error: 'each number must be between 0 and 7.' });
    }

    next();
}
