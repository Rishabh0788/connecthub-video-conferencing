export type User = { id: string; name: string; email: string; avatar?: string | null };
export type Meeting = { id: string; roomCode: string; title: string; status: 'SCHEDULED'|'LIVE'|'ENDED'; hostId: string; };
export type RemotePeer = { socketId: string; user: { id: string; name: string }; stream?: MediaStream; micOn?: boolean; cameraOn?: boolean; screenSharing?: boolean };
export type ChatMessage = { id: string; content: string; senderId: string; senderName: string; createdAt: string };
export type SharedFile = { id: string; meetingId: string; uploaderId: string; fileName: string; fileSize: number; mimeType: string; createdAt: string; downloadUrl: string; uploader?: { name: string } };
