FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./server/
COPY prisma ./prisma
RUN cd server && npm install && npx prisma generate --schema ../prisma/schema.prisma
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN cd server && npm run build
EXPOSE 5000
CMD ["sh", "-c", "cd server && npx prisma migrate deploy --schema ../prisma/schema.prisma && npm start"]
