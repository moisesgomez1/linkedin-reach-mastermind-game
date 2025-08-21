import express from 'express';
import { makeGuess, startGame, fetchSecret, setGameCookie } from '../controllers/gameController';

const router = express.Router();

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

router.post('/guess', makeGuess);

export default router;
