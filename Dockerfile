FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --include=dev

COPY . .

RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
