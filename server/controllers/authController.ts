import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

export async function signup(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body;

        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken.',
            });
        }

        const hashed = await hashPassword(password);
        const user = await User.create({ username, password: hashed });

        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            data: { id: user.id, username: user.username },
            message: 'Account created successfully.',
        });
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user || !(await comparePasswords(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.',
            });
        }

        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            data: { id: user.id, username: user.username },
            message: 'Login successful.',
        });
    } catch (err) {
        next(err);
    }
}

export function logout(_req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({
        success: true,
        message: 'Logout successful.',
    });
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token missing.',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        (req as any).userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};
