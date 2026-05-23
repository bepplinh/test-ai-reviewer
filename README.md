# ReviewPulse: AI-Powered PR Automation

**ReviewPulse** is an intelligent Engineering Automation tool designed to streamline the code review process. By integrating AI into the pull request workflow, it provides instant, actionable feedback, catches common bugs, and ensures coding standards are met before a human even opens the PR.

---

## 🚀 Key Features

- **Automated AI Reviews**: Leverages **Google Gemini AI** (Gemini-1.5-Pro) to analyze code changes and provide meaningful comments.
- **Asynchronous Processing**: Built with **BullMQ** and **Redis** to handle high-volume GitHub webhooks reliably without performance bottlenecks.
- **Webhook Idempotency**: Protects against duplicate GitHub webhook deliveries using `X-GitHub-Delivery` tracking.
- **Interactive Dashboard**: A modern, premium React dashboard to monitor PR status, review history, and system health.
- **Database Persistence**: Uses **Prisma** with **PostgreSQL** for robust data management and type-safe queries.
- **GitHub Integration**: Direct interaction with GitHub API to post line-level comments and review summaries.

## 🛠 Tech Stack

### Backend
- **Node.js & TypeScript**: Core logic with type safety.
- **Express**: RESTful API design.
- **BullMQ + Redis**: Distributed task queue for webhook processing.
- **Prisma + PostgreSQL**: ORM and relational database.
- **Google Generative AI**: Gemini integration for code analysis.
- **Zod**: Runtime schema validation.

### Frontend
- **React 19**: Modern UI development with the latest APIs.
- **Vite**: Ultra-fast build tool and dev server.
- **Vanilla CSS**: Custom design system with Glassmorphism aesthetics.
- **Lucide React**: Premium iconography.

---

## 🏗 Architecture

ReviewPulse follows a modular architecture designed for scalability:

1. **Webhook Layer**: Receives events from GitHub (Pull Request opened/updated).
2. **Queue Layer**: Pushes events into BullMQ to ensure no event is lost and to handle retries.
3. **AI Worker**: Pulls jobs from the queue, fetches the PR diff, and communicates with Gemini AI.
4. **Action Layer**: Posts the generated review back to GitHub as comments.
5. **Dashboard**: Provides a real-time view of the automation pipeline.

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- GitHub Personal Access Token (PAT)
- Google AI API Key (Gemini)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mindx-challenge-bepplinh-20260508
   ```

2. **Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/reviewpulse"
   REDIS_URL="redis://localhost:6379"
   GITHUB_TOKEN="your_github_token"
   GEMINI_API_KEY="your_gemini_key"
   ```

3. **Spin up Infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Install & Run**
   ```bash
   # Backend
   cd backend && pnpm install && pnpm run dev

   # Frontend (in another terminal)
   cd frontend && npm install && npm run dev
   ```

---

## 📈 Future Roadmap

- [ ] Support for multiple LLMs (OpenAI, Anthropic).
- [ ] Customizable review rules per repository.
- [ ] Slack/MS Teams integration for notifications.
- [ ] Support for inline code suggestions (Apply Fix).

---

## 📄 License
MIT

---
*Developed as part of the MindX Engineering Challenge.*
