import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { signToken } from '../utils/auth.js';
import { authRequired } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();
const credentials = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});
const loginSchema = credentials.omit({ name: true });
const cookieOptions = { httpOnly: true, secure: config.cookieSecure, sameSite: 'lax' as const, maxAge: 7 * 24 * 60 * 60 * 1000 };

router.post('/register', async (req, res, next) => {
  try {
    const data = credentials.parse(req.body);
    const email = data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email is already registered' });
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({ data: { name: data.name, email, passwordHash } });
    const token = signToken({ sub: user.id, name: user.name, email: user.email });
    res.cookie('connecthub_token', token, cookieOptions).status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
    const token = signToken({ sub: user.id, name: user.name, email: user.email });
    res.cookie('connecthub_token', token, cookieOptions).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

router.post('/logout', (_req, res) => { res.clearCookie('connecthub_token').json({ ok: true }); });
router.get('/me', authRequired, async (req, res) => res.json({ user: req.user }));
export default router;
