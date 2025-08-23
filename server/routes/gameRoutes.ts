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
} from '../controllers/gameController';

const router = express.Router();

/**
 * Retrieves a list of all Mastermind games.
 *
 * Each game includes metadata like attempts left, win/loss status, and timestamps.
 *
 * @route GET /games
 * @returns {Object[]} Array of game summaries.
 */
router.get('/games', listGames);

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
router.post('/start', fetchSecret, startGame, setGameCookie, (req, res) => {
    res.status(201).json({
        message: 'New game started. You have 10 attempts to guess the code.',
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
router.post('/games/:id/select', selectGame, setGameCookie, (req, res) => {
    res.status(200).json({
        message: 'Game Selected',
        gameId: res.locals.game.id as string,
    });
});

/**
 * Loads the current game state and guess history.
 *
 * Requires a valid `gameId` cookie.
 *
 * @route GET /game
 * @returns {Object} Game state: guesses, attempts left, win/loss/over status.
 */

router.get('/game', loadGame, getCurrentGame, (req, res) => {
    res.status(200).json({
        guesses: res.locals.history,
        attemptsLeft: res.locals.game.attemptsLeft,
        isWin: res.locals.game.isWin,
        isOver: res.locals.game.isOver,
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
router.post('/guess', loadGame, validateGuessInput, makeGuess, getCurrentGame, (req, res) => {
    res.status(200).json({
        guesses: res.locals.history,
        attemptsLeft: res.locals.game.attemptsLeft,
        isWin: res.locals.game.isWin,
        isOver: res.locals.game.isOver,
        mode: res.locals.game.mode,
        startTime: res.locals.game.startTime,
        timeLimit: res.locals.game.timeLimit,
    });
});

export default router;
