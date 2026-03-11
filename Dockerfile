FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --include=dev

COPY . .

RUN npx prisma generate && npx nest build && echo "=== BUILD OK ===" && ls -la dist/ && ls dist/main.js

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
