import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { prisma } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { config } from '../config.js';
import { safeFilename } from '../utils/room.js';

const router = Router();
router.use(authRequired);
const allowed = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/png','image/jpeg','text/plain','application/zip']);
const storage = multer.diskStorage({ destination: async (_req, _file, cb) => { await fs.mkdir(path.resolve('uploads'), { recursive: true }); cb(null, path.resolve('uploads')); }, filename: (_req, file, cb) => cb(null, safeFilename(file.originalname)) });
const upload = multer({ storage, limits: { fileSize: config.maxFileSize }, fileFilter: (_req, file, cb) => cb(null, allowed.has(file.mimetype)) });

async function isParticipant(meetingId: string, userId: string) {
  return !!(await prisma.meeting.findFirst({ where: { id: meetingId, OR: [{ hostId: userId }, { participants: { some: { userId, leftAt: null } } }] } }));
}

router.post('/meetings/:meetingId/files', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'A valid file is required' });
    if (!(await isParticipant(req.params.meetingId, req.user!.id))) { await fs.unlink(req.file.path).catch(() => undefined); return res.status(403).json({ message: 'You are not in this meeting' }); }
    const file = await prisma.sharedFile.create({ data: { meetingId: req.params.meetingId, uploaderId: req.user!.id, fileName: req.file.originalname.slice(0, 200), storageKey: req.file.filename, fileSize: req.file.size, mimeType: req.file.mimetype } });
    res.status(201).json({ file: { ...file, downloadUrl: `/api/files/${file.id}/download` } });
  } catch (e) { next(e); }
});

router.get('/meetings/:meetingId/files', async (req, res, next) => {
  try {
    if (!(await isParticipant(req.params.meetingId, req.user!.id))) return res.status(403).json({ message: 'Access denied' });
    const files = await prisma.sharedFile.findMany({ where: { meetingId: req.params.meetingId }, include: { uploader: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ files: files.map(f => ({ ...f, downloadUrl: `/api/files/${f.id}/download` })) });
  } catch (e) { next(e); }
});

router.get('/files/:id/download', async (req, res, next) => {
  try {
    const file = await prisma.sharedFile.findUnique({ where: { id: req.params.id } });
    if (!file || !(await isParticipant(file.meetingId, req.user!.id))) return res.status(404).json({ message: 'File not found' });
    res.download(path.resolve('uploads', file.storageKey), file.fileName);
  } catch (e) { next(e); }
});

router.delete('/files/:id', async (req, res, next) => {
  try {
    const file = await prisma.sharedFile.findUnique({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.uploaderId !== req.user!.id) return res.status(403).json({ message: 'Only the uploader can delete this file' });
    await prisma.sharedFile.delete({ where: { id: file.id } });
    await fs.unlink(path.resolve('uploads', file.storageKey)).catch(() => undefined);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
export default router;
