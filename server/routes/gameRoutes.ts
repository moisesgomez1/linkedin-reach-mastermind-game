import express from "express";
import { startGame } from "../controllers/gameController";

const router = express.Router();

/**
 * @route POST /start
 * @desc Starts a new Mastermind game
 * @returns { gameId }
 */
router.post("/start", startGame);

export default router;
