# ConnectHub – Real-Time Video Conferencing & Collaboration Platform

ConnectHub is a full-stack WebRTC + Socket.IO meeting application based on the supplied project specification. It includes authenticated meetings, multi-user audio/video, screen sharing, real-time chat, file sharing, a collaborative canvas, participant state, host meeting controls, PostgreSQL/Prisma persistence, and security middleware. The requested project scope is documented in the supplied specification.

## Stack
- React + TypeScript + Vite + Tailwind CSS
- Node.js + Express + TypeScript
- Socket.IO for signaling and collaboration
- WebRTC for media transport
- PostgreSQL + Prisma
- JWT in an HTTP-only cookie
- Multer for validated local file storage

## Structure
```text
connecthub/
├── client/
│   ├── src/components/
│   ├── src/hooks/
│   ├── src/pages/
│   ├── src/services/
│   └── src/types/
├── server/
│   └── src/{middleware,routes,socket,utils,types}
├── prisma/schema.prisma
├── docs/
├── uploads/
├── docker-compose.yml
└── .env.example
```

## Local setup
1. Install Node.js 20+ and PostgreSQL 16+.
2. Copy `.env.example` to `.env` and set secrets.
3. Run `npm install` from the repository root.
4. Run `npm run db:generate`.
5. Run `npm run db:migrate`.
6. Run `npm run dev`.
7. Open `http://localhost:5173`.

## Docker
```bash
docker compose up --build
```

## WebRTC
The initial implementation uses a peer-to-peer mesh topology, suitable for a student/demo deployment but not efficient for large rooms. Production deployments should configure a TURN server and consider an SFU such as LiveKit, mediasoup, or Janus. WebRTC media uses the browser's DTLS-SRTP transport; this project does not claim application-level end-to-end encryption beyond WebRTC's transport security.

## Security
- Passwords are hashed with bcrypt.
- JWT is stored in an HTTP-only cookie.
- API and Socket.IO requests are authenticated.
- Meeting access is checked server-side.
- Host-only meeting termination is checked server-side.
- Helmet, CORS, rate limiting and Zod validation are enabled.
- Upload size/type is validated and filenames are generated server-side.
- Never commit `.env` or real credentials.

## Important production notes
Use HTTPS/WSS, a managed PostgreSQL database, a persistent object store for files, and a TURN server. For multiple backend instances, add a Socket.IO Redis adapter. Do not expose private TURN credentials in frontend code.
