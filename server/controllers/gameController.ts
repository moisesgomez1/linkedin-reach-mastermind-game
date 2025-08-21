import { Request, Response, NextFunction } from 'express';
import { createGameSecret } from '../services/gameService'
import { evaluateGuess } from '../utils/gameLogic';
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

export const makeGuess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //just for testing will pass in the game id through the request body, will later retrieve from either session cookie or token.
    const { gameId, guess } = req.body;

    // Validate guess format (array of 4 numbers for now)
    if (!Array.isArray(guess) || guess.length !== 4 || guess.some(n => typeof n !== 'number')) {
      return res.status(400).json({ error: "Invalid guess format. Must be an array of 4 numbers." });
    }

    // Fetch game from db
    const game = await Game.findByPk(gameId);
    if (!game) return res.status(404).json({ error: "Game not found." });

    // Check if game is still active
    if (game.attemptsLeft <= 0) {
      return res.status(400).json({ error: "No attempts remaining. Game over." });
    }

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