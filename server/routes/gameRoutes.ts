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
import { Game } from 'server/models';

const router = express.Router();

router.get('/games', listGames);

/**
 * @route POST /start
 * @desc Starts a new Mastermind game
 * @returns { gameId }
 */
router.post('/start', fetchSecret, startGame, setGameCookie, (req, res) => {
    res.status(201).json({
        message: 'New game started. You have 10 attempts to guess the code.',
    });
});

router.post('/games/:id/select', selectGame, setGameCookie, (req, res) => {
    res.status(200).json({
        message: 'Game Selected',
        gameId: res.locals.game.id as string,
    });
});

router.get('/game', loadGame, getCurrentGame, (req, res) => {
    res.status(200).json({
        guesses: res.locals.history,
        attemptsLeft: res.locals.game.attemptsLeft,
        isWin: res.locals.game.isWin,
        isOver: res.locals.game.isOver,
    });
});

router.post('/guess', loadGame, validateGuessInput, makeGuess, getCurrentGame, (req, res) => {
    res.status(200).json({
        guesses: res.locals.history,
        attemptsLeft: res.locals.game.attemptsLeft,
        isWin: res.locals.game.isWin,
        isOver: res.locals.game.isOver,
    });
});

export default router;
