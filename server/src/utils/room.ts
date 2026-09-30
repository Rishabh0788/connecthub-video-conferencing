import crypto from 'node:crypto';
export function generateRoomCode() {
  return `${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}
export function safeFilename(original: string) {
  const ext = original.includes('.') ? original.slice(original.lastIndexOf('.')).toLowerCase() : '';
  return `${crypto.randomUUID()}${ext.replace(/[^.a-z0-9]/g, '')}`;
}
