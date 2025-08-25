import { Request, Response, NextFunction } from 'express';
import { createGameSecret } from '../services/gameService';
import { evaluateGuess } from '../utils/gameLogic';
import { Game, GameHistory } from '../models';

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
            return res.status(502).json({
                succcess: false,
                message: 'Failed to generate a valid secret.',
            });
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

        // Introducing game modes
        const mode = req.body?.mode === 'timed' ? 'timed' : 'classic';

        // Create a new Game record in the database
        const newGame = await Game.create({
            secret,
            attemptsLeft: mode === 'classic' ? 10 : null, // use null or a high number
            mode,
            startTime: mode === 'timed' ? new Date() : null, //will be null for classic mode
            timeLimit: mode === 'timed' ? 60 : null, // 60 seconds for timed mode, null for classic
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
            return res.status(400).json({
                success: false,
                message: 'Missing gameId cookie.',
            });
        }

        // making a query to find the game by the uuid
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found.',
            });
        }

        res.locals.gameId = gameId;
        res.locals.game = game;
        next();
    } catch (err) {
        next(err);
    }
}

/**
 * Processes a player's guess for the current Mastermind game.
 *
 * Assumes the game has already been loaded and validated by previous middleware.
 * - Evaluates the guess using the game's secret.
 * - Updates the game state (attempts left, win/loss status).
 * - Persists the guess in the GameHistory table.
 * - Updates `res.locals.game` with the modified game instance.
 *
 * @param {Request} req - Express request object, must contain `guess` in `req.body`.
 * @param {Response} res - Express response object, used to read and modify locals.
 * @param {NextFunction} next - Express next function to pass control to next middleware.
 *
 * @returns {void} Passes control to the next middleware or error handler.
 */
export async function makeGuess(req: Request, res: Response, next: NextFunction) {
    try {
        const { guess } = req.body;
        const { gameId } = res.locals;
        const { game } = res.locals;

        console.log('game from res.locals', res.locals.game);

        // Enforce timer logic for 'timed' mode
        if (game.mode === 'timed') {
            if (!game.startTime || !game.timeLimit) {
                return res.status(500).json({
                    success: false,
                    message: 'Timed game is missing timing configuration.',
                });
            }

            const now = new Date();
            const elapsed = (now.getTime() - new Date(game.startTime).getTime()) / 1000; //get elapsed time in seconds
            console.log('Elapsed time in seconds:', elapsed);

            if (elapsed > game.timeLimit) {
                // if elapsed time exceeds time limit then game is over and we updated isOver to true.
                game.isOver = true;
                await game.save();
                return res.status(400).json({
                    success: false,
                    message: 'Time is up! Game over.',
                });
            }
        }

        // Check if game is still active depending on mode
        if (game.mode === 'classic' && game.attemptsLeft <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No attempts remaining. Game over.',
            });
        }

        //if game is already won or over then we should not allow more guesses. This more so works for the classic mode.
        if (game.isOver) {
            return res.status(400).json({
                success: false,
                message: 'Game is already over.',
            });
        }

        console.log('This is the game secret', game.secret);

        // Evaluate the guess with the util function we imported
        const { correctNumbers, correctPositions } = evaluateGuess(game.secret, guess);

        // Update attempts
        if (game.mode === 'classic') {
            game.attemptsLeft -= 1;
        }

        // Check for win condition
        if (correctPositions === 4) {
            game.isWin = true;
            game.isOver = true;
        } else if (game.attemptsLeft === 0) {
            game.isOver = true;
        }
        await game.save(); //db query, returns the saved data.

        // We are creating a new guess entry in the game_history table after every guess. This gets returned to the client to show history
        const newGuess = await GameHistory.create({
            gameId: game.id,
            guess,
            correctNumbers,
            correctPositions,
        });
        // // we are now sending the full History instead of a single guess after every request from the client. This helps avoid having different response types in the frontend.
        // const fullHistory = await GameHistory.findAll({ where: { gameId: game.id }, order: [['createdAt','ASC']] });

        // return res.status(200).json({
        //     guesses: fullHistory,
        //     isWin: game.isWin,
        //     isOver: game.isOver,
        //     attemptsLeft: game.attemptsLeft,
        // });
        res.locals.game = game; //overwritting res.locals.game with new game state.
        return next();
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
        return res.status(400).json({
            success: false,
            message: 'guess must be an array.',
        });
    }
    if (guess.length !== 4) {
        return res.status(400).json({
            success: false,
            message: 'guess must contain exactly 4 numbers.',
        });
    }
    if (guess.some((n) => typeof n !== 'number' || !Number.isInteger(n))) {
        return res.status(400).json({
            success: false,
            message: 'guess must contain integers.',
        });
    }
    if (guess.some((n) => n < 0 || n > 7)) {
        return res.status(400).json({
            success: false,
            message: 'each number must be between 0 and 7.',
        });
    }

    next();
}

/**
 * Middleware to retrieve and list all games.
 *
 * Queries the database for all `Game` records, selecting only specific attributes:
 * Results are ordered by `createdAt` in descending order.
 *
 * On success, responds with a JSON object containing the list of games.
 * On failure, passes the error to the error-handling middleware.
 *
 * @async
 * @param {Request} _req - The HTTP request object (not used).
 * @param {Response} res - The HTTP response object; sends back the games list in JSON format.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 *
 * @returns {void} Sends a `200 OK` response with `{ games: Game[] }` if successful,
 *                 or calls `next(err)` on failure.
 */
export async function listGames(_req: Request, res: Response, next: NextFunction) {
    try {
        const games = await Game.findAll({
            attributes: [
                'id',
                'attemptsLeft',
                'isWin',
                'isOver',
                'mode',
                'startTime',
                'timeLimit',
                'createdAt',
                'updatedAt',
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            data: { games },
            message: 'Games retrieved successfully',
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Middleware to select a game by its ID from the request parameters.
 *
 * - Extracts the `id` parameter from the route.
 * - Queries the database for a `Game` record with the given ID.
 * - If no game is found, responds with a `404 Not Found` error.
 * - If found, attaches the `Game` instance to `res.locals.game` and continues.
 *
 * @async
 * @param {Request} req - The HTTP request object; must include `req.params.id`.
 * @param {Response} res - The HTTP response object; used to attach the game or send error responses.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 *
 * @returns {void} Sends a `404` response if the game is not found,
 *                 otherwise calls `next()` after attaching the game.
 */
export async function selectGame(req: Request, res: Response, next: NextFunction) {
    try {
        //Note: we can easily just use the id from req.params but just for validation we will query the database to make sure it is valid.
        const { id } = req.params;
        console.log('id from req params', id);

        const game = await Game.findByPk(id);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found.',
            });
        }

        res.locals.game = game;
        return next();
    } catch (err) {
        next(err);
    }
}

/**
 * Middleware to retrieve the current game and its history.
 *
 * - Uses the `game` object stored in `res.locals.game` (set by previous middleware).
 * - Fetches all `GameHistory` records associated with the game, ordered by creation time.
 * - Attaches the history array to `res.locals.history` for later middleware or response handling.
 *
 * @async
 * @param {Request} _req - The HTTP request object (not used).
 * @param {Response} res - The HTTP response object; used to attach the game history.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 *
 * @returns {void} Calls `next()` after attaching `history`, or passes error to error handler.
 */
export async function getCurrentGame(_req: Request, res: Response, next: NextFunction) {
    try {
        const game = res.locals.game;
        const history = await GameHistory.findAll({
            where: { gameId: game.id },
            order: [['createdAt', 'ASC']],
            attributes: ['id', 'guess', 'correctNumbers', 'correctPositions', 'createdAt'],
        });

        res.locals.history = history;
        return next();
    } catch (err) {
        next(err);
    }
}

/**
 * Middleware to mark the current game as expired.
 *
 * - Retrieves the `game` object from `res.locals.game` (populated by earlier middleware).
 * - Sets `isOver = true` on the game instance and saves the change to the database.
 * - Does not send a response; the frontend is responsible for handling UI updates after expiration.
 * - Typically triggered when the game is considered complete (e.g., timer expiration in timed mode).
 *
 * @async
 * @param {Request} _req - The HTTP request object (not used).
 * @param {Response} res - The HTTP response object; used to access and modify the current game.
 * @param {NextFunction} next - Callback to pass control to the next middleware or error handler.
 *
 * @returns {void} Calls `next()` after updating the game, or passes an error to the handler.
 */
export async function expireGame(_req: Request, res: Response, next: NextFunction) {
    try {
        const game = res.locals.game;

        if (game.isOver) {
            // Game is already expired — optionally log this or return early
            return next(); // Just proceed without changes
        }
        game.isOver = true;
        await game.save();
        return next();
    } catch (err) {
        next(err);
    }
}
