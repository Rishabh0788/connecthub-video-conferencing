import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { generateRoomCode } from '../utils/room.js';

const router = Router();
router.use(authRequired);
const titleSchema = z.object({ title: z.string().trim().min(2).max(120) });

router.post('/', async (req, res, next) => {
  try {
    const { title } = titleSchema.parse(req.body);
    let roomCode = generateRoomCode();
    while (await prisma.meeting.findUnique({ where: { roomCode } })) roomCode = generateRoomCode();
    const meeting = await prisma.meeting.create({ data: { title, roomCode, hostId: req.user!.id } });
    res.status(201).json({ meeting });
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const meetings = await prisma.meeting.findMany({ where: { OR: [{ hostId: req.user!.id }, { participants: { some: { userId: req.user!.id } } }] }, orderBy: { createdAt: 'desc' }, take: 20 });
    res.json({ meetings });
  } catch (e) { next(e); }
});

router.get('/by-code/:roomCode', async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { roomCode: req.params.roomCode } });
    if (!meeting || meeting.status === 'ENDED') return res.status(404).json({ message: 'Meeting not found or ended' });
    res.json({ meeting: { id: meeting.id, roomCode: meeting.roomCode, title: meeting.title, status: meeting.status, hostId: meeting.hostId } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id }, include: { host: { select: { id: true, name: true } }, participants: { where: { leftAt: null }, include: { user: { select: { id: true, name: true } } } } } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json({ meeting });
  } catch (e) { next(e); }
});

router.post('/:id/join', async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
    if (!meeting || meeting.status === 'ENDED') return res.status(404).json({ message: 'Meeting unavailable' });
    await prisma.meetingParticipant.upsert({ where: { meetingId_userId: { meetingId: meeting.id, userId: req.user!.id } }, create: { meetingId: meeting.id, userId: req.user!.id }, update: { joinedAt: new Date(), leftAt: null } });
    if (meeting.status === 'SCHEDULED') await prisma.meeting.update({ where: { id: meeting.id }, data: { status: 'LIVE', startedAt: new Date() } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/:id/leave', async (req, res, next) => {
  try {
    await prisma.meetingParticipant.update({ where: { meetingId_userId: { meetingId: req.params.id, userId: req.user!.id } }, data: { leftAt: new Date() } }).catch(() => undefined);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/:id/end', async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.hostId !== req.user!.id) return res.status(403).json({ message: 'Only the host can end the meeting' });
    const updated = await prisma.meeting.update({ where: { id: meeting.id }, data: { status: 'ENDED', endedAt: new Date() } });
    res.json({ meeting: updated });
  } catch (e) { next(e); }
});

router.get('/:id/participants', async (req, res, next) => {
  try {
    const participants = await prisma.meetingParticipant.findMany({ where: { meetingId: req.params.id, leftAt: null }, include: { user: { select: { id: true, name: true, avatar: true } } } });
    res.json({ participants });
  } catch (e) { next(e); }
});
export default router;
