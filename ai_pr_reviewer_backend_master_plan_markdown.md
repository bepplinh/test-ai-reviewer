# AI PR Reviewer Assistant — Backend Master Plan

# 1. Project Overview

## Project Name
AI PR Reviewer Assistant

---

## Objective
Build an AI-powered engineering workflow automation tool that automatically reviews GitHub Pull Requests using AI.

The system should:
- receive GitHub webhook events
- fetch Pull Request changes
- analyze code changes using AI
- generate review suggestions
- post comments back to GitHub PR
- expose APIs for frontend dashboard

---

# 2. Problem Statement

Code review is one of the most repetitive and time-consuming engineering tasks.

Common problems:
- reviewers spend too much time reading PR diffs
- small issues are often missed
- validation/security issues may slip through
- repetitive comments appear frequently
- onboarding junior developers is slower

This project aims to automate the first layer of code review using AI.

---

# 3. Solution

The system automatically analyzes Pull Requests when:
- a PR is opened
- a PR is updated

Workflow:

```txt
GitHub PR Event
        ↓
GitHub Webhook
        ↓
ExpressJS Backend
        ↓
Fetch PR Files/Diff
        ↓
OpenAI Analysis
        ↓
Generate Review Result
        ↓
Save Review Result
        ↓
Post Comment Back To GitHub PR
        ↓
Frontend Dashboard Displays Result
```

---

# 4. Technical Stack

# Backend

- Node.js
- ExpressJS
- TypeScript

---

# Database

- PostgreSQL
- Prisma ORM

---

# AI

- OpenAI API

---

# External Integrations

- GitHub Webhook API
- GitHub REST API

---

# Optional Enhancements

- Redis
- BullMQ Queue
- Docker
- Winston/Pino Logging

---

# 5. Core Features (MVP)

# Feature 1 — GitHub Webhook Receiver

The backend must receive webhook events from GitHub.

Supported events:
- pull_request.opened
- pull_request.synchronize

Example webhook payload:

```json
{
  "action": "opened",
  "pull_request": {
    "number": 1,
    "title": "Add payment retry logic"
  }
}
```

Responsibilities:
- validate event type
- verify GitHub signature
- trigger review process

---

# Feature 2 — Fetch Pull Request Changes

The backend fetches changed files from GitHub API.

Endpoint:

```txt
GET /repos/{owner}/{repo}/pulls/{pull_number}/files
```

Required data:
- filename
- patch/diff
- additions
- deletions
- file status

Example:

```json
{
  "filename": "payment.service.ts",
  "patch": "@@ -1,4 +1,6 @@ ..."
}
```

---

# Feature 3 — AI Code Review Engine

The backend sends PR diff data to OpenAI.

AI analyzes:
- possible bugs
- validation issues
- security concerns
- race conditions
- naming improvements
- clean code suggestions
- duplicated logic

Expected AI output:

```json
{
  "summary": "This PR adds payment retry logic.",
  "issues": [
    {
      "severity": "high",
      "message": "Missing validation in payment controller"
    }
  ]
}
```

---

# Feature 4 — Auto Comment PR

The backend automatically comments review results back to GitHub.

Endpoint:

```txt
POST /repos/{owner}/{repo}/issues/{issue_number}/comments
```

Example comment:

```txt
AI Review Summary

1. Missing validation in payment controller.
2. Possible race condition in stock update.
3. Consider extracting duplicate logic.
```

---

# Feature 5 — Save Review Result

The backend stores review history in database.

Stored data:
- repository
- PR number
- author
- AI summary
- issues
- status
- timestamps

---

# Feature 6 — REST API For Frontend

Expose APIs for dashboard.

Required APIs:

```txt
GET /api/reviews
GET /api/reviews/:id
```

Optional APIs:

```txt
POST /api/reviews/:id/retry
```

---

# 6. System Architecture

```txt
┌──────────────────┐
│     GitHub       │
└────────┬─────────┘
         │ Webhook
         ▼
┌──────────────────┐
│ Express Backend  │
└────────┬─────────┘
         │
         ├─────────────► Verify Signature
         │
         ├─────────────► Fetch PR Files
         │
         ├─────────────► OpenAI Analysis
         │
         ├─────────────► Save Database
         │
         └─────────────► Comment Back To PR

Frontend Dashboard
        ▲
        │ REST API
        ▼
┌──────────────────┐
│ PostgreSQL DB    │
└──────────────────┘
```

---

# 7. Folder Structure

```txt
src/
├── config/
│   ├── env.ts
│   └── openai.ts
│
├── controllers/
│   ├── webhook.controller.ts
│   └── review.controller.ts
│
├── routes/
│   ├── webhook.route.ts
│   └── review.route.ts
│
├── services/
│   ├── github.service.ts
│   ├── openai.service.ts
│   ├── review.service.ts
│   ├── comment.service.ts
│   └── prompt.service.ts
│
├── repositories/
│   └── review.repository.ts
│
├── middlewares/
│   ├── error.middleware.ts
│   └── verify-signature.middleware.ts
│
├── utils/
│   ├── logger.ts
│   ├── formatter.ts
│   └── helper.ts
│
├── prompts/
│   └── review.prompt.ts
│
├── prisma/
│   └── client.ts
│
├── types/
│   └── github.types.ts
│
├── app.ts
└── server.ts
```

---

# 8. Database Design

# Table: reviews

```prisma
model Review {
  id          String   @id @default(cuid())
  repoName    String
  prNumber    Int
  prTitle     String
  author      String
  status      String
  aiSummary   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  comments    ReviewComment[]
}
```

---

# Table: review_comments

```prisma
model ReviewComment {
  id         String   @id @default(cuid())
  reviewId   String
  severity   String
  message    String
  filePath   String?
  line       Int?

  review     Review @relation(fields: [reviewId], references: [id])
}
```

---

# 9. Environment Variables

```env
PORT=3000
DATABASE_URL=
OPENAI_API_KEY=
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=
```

---

# 10. GitHub Webhook Setup

# Step 1
Create GitHub repository.

---

# Step 2
Go to:

```txt
Repository → Settings → Webhooks
```

---

# Step 3
Add webhook URL:

```txt
https://your-domain.com/api/webhooks/github
```

---

# Step 4
Select events:

```txt
Pull requests
```

---

# Step 5
Add webhook secret.

---

# 11. API Design

# Webhook API

## POST /api/webhooks/github

Responsibilities:
- verify signature
- detect event type
- start review process

Response:

```json
{
  "success": true
}
```

---

# Reviews API

## GET /api/reviews

Returns all reviews.

Example:

```json
[
  {
    "id": "1",
    "repoName": "ecommerce-api",
    "prNumber": 12,
    "status": "COMPLETED"
  }
]
```

---

## GET /api/reviews/:id

Returns review detail.

Example:

```json
{
  "id": "1",
  "summary": "This PR adds retry logic.",
  "issues": [
    {
      "severity": "HIGH",
      "message": "Missing validation"
    }
  ]
}
```

---

# 12. AI Prompt Design

# System Prompt

```txt
You are a senior backend engineer reviewing a pull request.

Focus on:
- bugs
- validation
- security
- race conditions
- clean code
- naming
- duplicated logic

Keep feedback concise and actionable.
```

---

# User Prompt

```txt
Analyze the following pull request diff and generate review feedback.

Return JSON response.
```

---

# Expected AI Response

```json
{
  "summary": "This PR adds payment retry logic.",
  "issues": [
    {
      "severity": "HIGH",
      "message": "Missing input validation",
      "filePath": "payment.controller.ts"
    }
  ]
}
```

---

# 13. Review Processing Flow

# Step 1 — Receive Webhook

```txt
POST /api/webhooks/github
```

---

# Step 2 — Verify Signature

Use:

```txt
X-Hub-Signature-256
```

---

# Step 3 — Extract PR Info

Extract:
- owner
- repo
- pull number

---

# Step 4 — Fetch Changed Files

Call GitHub API.

---

# Step 5 — Build AI Prompt

Combine:
- PR title
- PR description
- file patches

---

# Step 6 — Send To OpenAI

Receive review result.

---

# Step 7 — Save Database

Store:
- review summary
- issues
- status

---

# Step 8 — Comment PR

Post comment to GitHub.

---

# 14. Status Flow

```txt
PENDING
PROCESSING
COMPLETED
FAILED
```

---

# 15. Error Handling

Handle cases:
- invalid webhook signature
- unsupported event
- no changed files
- GitHub API failure
- OpenAI timeout
- invalid AI JSON
- database failure

---

# 16. Security Considerations

# MUST HAVE

## Verify GitHub Signature
Prevent fake webhook requests.

---

## Use Environment Variables
Never expose:
- OpenAI API key
- GitHub token

---

## Ignore Dangerous Files
Optional:
- binaries
- large generated files
- node_modules

---

# 17. Logging

Recommended logs:

```txt
Webhook received
Fetching PR files
Generating AI review
Saving review
Posting GitHub comment
```

Optional:
- Winston
- Pino

---

# 18. Optional Queue Architecture (Advanced)

If time allows:

```txt
Webhook
   ↓
Queue
   ↓
Worker
   ↓
AI Review
```

Benefits:
- avoid webhook timeout
- scalable architecture
- retry failed jobs

Suggested tools:
- Redis
- BullMQ

---

# 19. Deployment Suggestions

# Backend Hosting

Options:
- Railway
- Render
- VPS

---

# Database Hosting

Options:
- Neon PostgreSQL
- Supabase

---

# Local Webhook Testing

Use:

```txt
ngrok
```

Example:

```bash
ngrok http 3000
```

---

# 20. Development Roadmap

# Day 1

## Goal
Webhook flow working.

## Tasks
- setup ExpressJS + TypeScript
- setup Prisma + PostgreSQL
- create webhook endpoint
- verify GitHub signature
- fetch PR files

---

# Day 2

## Goal
AI review working.

## Tasks
- integrate OpenAI
- build prompt
- generate review result
- comment back to GitHub PR
- save review to DB

---

# Day 3

## Goal
Polish and finalize.

## Tasks
- cleanup architecture
- improve logging
- add error handling
- expose frontend APIs
- write README
- record demo
- deploy application

---

# 21. Suggested Commit Strategy

```bash
git commit -m "init express typescript backend"
git commit -m "setup prisma and postgres"
git commit -m "implement github webhook"
git commit -m "fetch pull request diff"
git commit -m "integrate openai review engine"
git commit -m "implement github comment service"
git commit -m "add review APIs"
git commit -m "improve error handling and logging"
```

---

# 22. README Structure Suggestion

```md
# AI PR Reviewer Assistant

## Problem
...

## Solution
...

## Features
...

## Architecture
...

## Tech Stack
...

## Setup
...

## Demo
...

## Reflection
...
```

---

# 23. Demo Flow

# Demo Scenario

1. Create Pull Request
2. GitHub sends webhook
3. Backend receives event
4. AI analyzes code
5. GitHub PR receives AI comment
6. Frontend dashboard displays review result

---

# 24. Future Improvements

Possible future enhancements:
- inline code comments
- review score system
- multiple AI models
- custom rule engine
- Slack/Discord notifications
- support GitLab/Bitbucket
- semantic code analysis
- caching and optimization

---

# 25. Final Goal

This project demonstrates:
- backend engineering skills
- webhook integrations
- AI workflow automation
- GitHub API integration
- clean architecture
- engineering productivity mindset

The final result should feel like a real internal engineering productivity tool rather than a simple CRUD application.

