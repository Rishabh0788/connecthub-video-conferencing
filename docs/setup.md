# Setup

## Environment
Copy `.env.example` to `.env`.

Required: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`.

Optional WebRTC variables: `STUN_URL`, `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL`.

## Database
```bash
npm install
npm run db:generate
npm run db:migrate
```

## Run
```bash
npm run dev
```

The client is served by Vite on port 5173 and the API/socket server on port 5000 by default.
