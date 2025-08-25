import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const comparePasswords = async (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const generateToken = (id: string) =>
    jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
    jwt.verify(token, JWT_SECRET);
