# Sociable Beet

Portable collaborative workspace + daily inspirational social publishing.

## Stack
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Docker Compose
- Redis
- MinIO (S3-compatible storage)

## Included
- Minimal-color workspace dashboard
- Projects
- Tasks
- Social Studio
- Daily inspirational post workflow
- Draft / scheduled / published post states
- Multi-channel targeting
- REST API starter
- Portable Docker infrastructure

## Run

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000

## Social publishing
The included backend stores and schedules posts. Real publishing to Facebook,
Instagram, LinkedIn, X, Threads, Telegram, WhatsApp Channels, and YouTube
Community should be added with official provider APIs and credentials.
