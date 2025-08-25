import express from 'express';
import {
    makeGuess,
    startGame,
    fetchSecret,
    setGameCookie,
    loadGame,
    validateGuessInput,
    listGames,
    selectGame,
    getCurrentGame,
    expireGame,
} from '../controllers/gameController';

import { requireAuth } from '../controllers/authController';

const router = express.Router();

/**
 * Retrieves a list of all Mastermind games.
 *
 * Each game includes metadata like attempts left, win/loss status, and timestamps.
 *
 * @route GET /games
 * @returns {Object[]} Array of game summaries.
 */
router.get('/games', requireAuth, listGames);

/**
 * Starts a new Mastermind game session.
 *
 * - Generates a secret code.
 * - Creates a new game in the database.
 * - Sets a `gameId` cookie for tracking.
 *
 * @route POST /start
 * @returns {Object} Confirmation message with game instructions.
 */
router.post('/start', requireAuth, fetchSecret, startGame, setGameCookie, (req, res) => {
    res.status(201).json({
        success: true,
        message: 'New game started.',
    });
});

/**
 * Selects an existing game by ID and sets a cookie for tracking.
 *
 * Used to resume a previously started game session.
 *
 * @route POST /games/:id/select
 * @returns {Object} Confirmation message and selected game ID.
 */
router.post('/games/:id/select', requireAuth, selectGame, setGameCookie, (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            gameId: res.locals.game.id as string,
        },

        message: 'Game Selected',
    });
});

/**
 * Loads the current game state and guess history.
 *
 * Requires a valid `gameId` cookie.
 *
 * @route GET /game
 * @returns {Object} Game state: guesses, attempts left, win/loss/over status, mode, startTime and timeLimit depending on the mode or else null.
 */

router.get('/game', requireAuth, loadGame, getCurrentGame, (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            guesses: res.locals.history,
            attemptsLeft: res.locals.game.attemptsLeft,
            isWin: res.locals.game.isWin,
            isOver: res.locals.game.isOver,
            mode: res.locals.game.mode,
            secret: res.locals.game.isOver ? res.locals.game.secret : undefined,
            startTime: res.locals.game.startTime,
            timeLimit: res.locals.game.timeLimit,
        },
        message: 'Current game state retrieved.',
    });
});

/**
 * Submits a guess for the current game.
 *
 * - Validates input.
 * - Evaluates guess against secret.
 * - Updates game state.
 * - Returns full updated game data and guess history.
 *
 * @route POST /guess
 * @returns {Object} Updated game state and guess history.
 */
router.post(
    '/guess',
    requireAuth,
    loadGame,
    validateGuessInput,
    makeGuess,
    getCurrentGame,
    (req, res) => {
        const latestGuess = res.locals.history[res.locals.history.length - 1];
        const { correctNumbers, correctPositions } = latestGuess;

        const message = `${correctNumbers} correct number${correctNumbers !== 1 ? 's' : ''} and ${correctPositions} correct location${correctPositions !== 1 ? 's' : ''}`;

        res.status(200).json({
            success: true,
            data: {
                guesses: res.locals.history,
                attemptsLeft: res.locals.game.attemptsLeft,
                isWin: res.locals.game.isWin,
                isOver: res.locals.game.isOver,
                secret: res.locals.game.isOver ? res.locals.game.secret : undefined,
            },
            message,
        });
    }
);

/**
 * Marks the current game as expired.
 *
 * - Retrieves the current game via middleware.
 * - Sets `isOver = true` and saves the update.
 * - Typically used when a game times out (e.g., in timed mode).
 * - Does not affect game mode or score, only marks it as complete.
 *
 * @route PUT /game/expire
 * @returns {Object} Confirmation message indicating the game was marked as expired.
 */
router.put('/game/expire', requireAuth, loadGame, expireGame, (req, res) => {
    res.status(200).json({
        success: true,
    data: {
      secret: res.locals.game?.secret, 
    },
    message: 'Game expired successfully.',
    });
});

export default router;
