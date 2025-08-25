import express from 'express';
import { signup, login, logout } from '../controllers/authController';

const router = express.Router();

/**
 * @route POST /auth/signup
 */
router.post('/signup', signup);

/**
 * @route POST /auth/login
 */
router.post('/login', login);

/**
 * @route POST /auth/logout
 */
router.post('/logout', logout);

export default router;
