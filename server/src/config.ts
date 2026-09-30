import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing environment variable: ${key}`);
}

export const config = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  clientUrl: process.env.CLIENT_URL!,
  serverUrl: process.env.SERVER_URL ?? 'http://localhost:5000',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  maxFileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 25) * 1024 * 1024,
  iceServers: [
    { urls: process.env.STUN_URL ?? 'stun:stun.l.google.com:19302' },
    ...(process.env.TURN_URL ? [{ urls: process.env.TURN_URL, username: process.env.TURN_USERNAME, credential: process.env.TURN_CREDENTIAL }] : [])
  ]
};
