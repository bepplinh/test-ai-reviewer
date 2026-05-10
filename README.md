# 🤖 AI PR Reviewer (V2 Production Ready)

A production-grade AI-powered Pull Request reviewer that uses OpenAI to analyze code changes, identify bugs, security risks, and performance issues, then posts comments directly to GitHub.

## 🚀 Features

- **Asynchronous Review Pipeline**: Uses **BullMQ** and **Redis** for reliable background processing.
- **Webhook Idempotency**: Protects against duplicate GitHub webhook deliveries using `X-GitHub-Delivery` tracking.
- **Module-based Architecture**: Clean, scalable codebase organized by business modules.
- **Advanced Filtering**: Automatically ignores generated files, lock files, and binaries to save tokens.
- **Cost & Token Tracking**: Logs estimated USD cost and token usage for every review run.
- **PR Dashboard API**: Endpoints for listing pull requests, review history, and aggregated statistics.
- **Multi-stage Docker Support**: Production-ready Dockerfile for easy deployment.

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ with Redis
- **AI**: OpenAI API (GPT-4o-mini)
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```text
backend/
├── src/
│   ├── modules/          # Business logic (webhook, review, pr, etc.)
│   ├── shared/           # Common utils, middlewares, and loggers
│   ├── config/           # Environment and client configurations
│   ├── prisma/           # Prisma client singleton
│   ├── server.ts         # Entry point
│   └── app.ts            # Express app setup
├── prisma/               # Schema and migrations
└── Dockerfile            # Production build
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js v20+ & pnpm
- Docker & Docker Compose
- GitHub Personal Access Token (with `repo` permissions)
- OpenAI API Key

### 2. Setup Environment
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_pr_reviewer"
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"
GITHUB_TOKEN="ghp_..."
GITHUB_WEBHOOK_SECRET="your-secret"
```

### 3. Run with Docker
```bash
docker-compose up -d
```

### 4. Local Development
```bash
cd backend
pnpm install
npx prisma generate
pnpm dev
```

## 📡 API Endpoints

- `POST /api/webhooks/github`: Receives GitHub webhooks.
- `GET /api/pull-requests`: List all PRs and their latest review status.
- `GET /api/pull-requests/:id`: Full history and issues for a specific PR.
- `GET /api/stats`: Total reviews, success rate, and accumulated cost.

---
*Developed as part of the MindX Engineering Challenge.*
