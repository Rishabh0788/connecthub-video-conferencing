import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import cookie from 'cookie';
import { config } from '../config.js';
import { verifyToken } from '../utils/auth.js';
import { prisma } from '../db.js';

export function setupSocket(server: HttpServer) {
  const io = new Server(server, { cors: { origin: config.clientUrl, credentials: true } });
  const socketUser = new Map<string, { id: string; name: string }>();

  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie;
      const token = raw ? cookie.parse(raw).connecthub_token : undefined;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      socketUser.set(socket.id, { id: payload.sub, name: payload.name });
      next();
    } catch { next(new Error('Unauthorized')); }
  });

  io.on('connection', socket => {
    const user = socketUser.get(socket.id)!;
    socket.on('join-meeting', async ({ meetingId }) => {
      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting || meeting.status === 'ENDED') return socket.emit('meeting-error', 'Meeting is unavailable');
      const allowed = meeting.hostId === user.id || !!(await prisma.meetingParticipant.findUnique({ where: { meetingId_userId: { meetingId, userId: user.id } } }));
      if (!allowed) return socket.emit('meeting-error', 'Join the meeting through the application first');
      const room = `meeting:${meetingId}`;
      const existing = Array.from(io.sockets.adapter.rooms.get(room) ?? []).filter(id => id !== socket.id).map(id => ({ socketId: id, user: socketUser.get(id) })).filter(x => x.user);
      socket.join(room);
      socket.data.meetingId = meetingId;
      socket.emit('existing-participants', existing);
      socket.to(room).emit('participant-joined', { socketId: socket.id, user });
    });

    const relay = (event: string) => socket.on(event, payload => {
      const meetingId = socket.data.meetingId as string | undefined;
      if (!meetingId) return;
      const message = { ...payload, from: socket.id, user };
      if (payload?.to) io.to(payload.to).emit(event, message); else socket.to(`meeting:${meetingId}`).emit(event, message);
    });
    ['offer','answer','ice-candidate','toggle-mic','toggle-camera','screen-share-started','screen-share-stopped','whiteboard-draw','whiteboard-clear','whiteboard-undo','whiteboard-redo','file-shared'].forEach(relay);

    socket.on('chat-message-save', async ({ meetingId, content }) => {
      if (socket.data.meetingId !== meetingId || typeof content !== 'string' || !content.trim()) return;
      const msg = await prisma.meetingMessage.create({ data: { meetingId, senderId: user.id, content: content.trim().slice(0, 2000) }, include: { sender: { select: { name: true } } } });
      io.to(`meeting:${meetingId}`).emit('chat-message', { id: msg.id, content: msg.content, senderId: user.id, senderName: msg.sender.name, createdAt: msg.createdAt });
    });

    socket.on('end-meeting', async ({ meetingId }) => {
      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting || meeting.hostId !== user.id) return;
      await prisma.meeting.update({ where: { id: meetingId }, data: { status: 'ENDED', endedAt: new Date() } });
      io.to(`meeting:${meetingId}`).emit('meeting-ended');
    });

    socket.on('disconnect', () => {
      const meetingId = socket.data.meetingId as string | undefined;
      if (meetingId) socket.to(`meeting:${meetingId}`).emit('participant-left', { socketId: socket.id });
      socketUser.delete(socket.id);
    });
  });
  return io;
}
