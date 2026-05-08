# AI PR Reviewer Assistant — Engineering Specifications Addendum

# 1. Purpose

This document contains additional engineering specifications required for AI coding agents to generate a production-quality backend implementation with minimal hallucination and architectural inconsistency.

This document complements the main Backend Master Plan.

---

# 2. API Response Contracts

# GET /api/reviews

## Response Example

```json
[
  {
    "id": "clx-review-1",
    "repoName": "ecommerce-api",
    "prNumber": 12,
    "prTitle": "Add payment retry logic",
    "author": "john",
    "status": "COMPLETED",
    "createdAt": "2026-05-08T10:00:00.000Z"
  }
]
```

---

# GET /api/reviews/:id

## Response Example

```json
{
  "id": "clx-review-1",
  "repoName": "ecommerce-api",
  "prNumber": 12,
  "prTitle": "Add payment retry logic",
  "author": "john",
  "status": "COMPLETED",
  "summary": "This PR adds retry logic and improves webhook validation.",
  "issues": [
    {
      "severity": "HIGH",
      "category": "VALIDATION",
      "message": "Missing validation for payment amount",
      "suggestion": "Validate req.body.amount before processing payment",
      "filePath": "src/controllers/payment.controller.ts",
      "line": 25
    }
  ],
  "createdAt": "2026-05-08T10:00:00.000Z"
}
```

---

# POST /api/reviews/:id/retry

## Response Example

```json
{
  "success": true,
  "message": "Review retry queued"
}
```

---

# 3. AI Output Schema

The AI MUST ALWAYS return valid JSON.

## Required Schema

```json
{
  "summary": "string",
  "issues": [
    {
      "severity": "LOW | MEDIUM | HIGH",
      "category": "SECURITY | VALIDATION | CLEAN_CODE | PERFORMANCE | BUG_RISK",
      "message": "string",
      "suggestion": "string",
      "filePath": "string",
      "line": 1
    }
  ]
}
```

---

# AI Response Rules

- Return ONLY valid JSON
- No markdown formatting
- No explanation outside JSON
- Keep summary under 150 words
- Maximum 10 issues
- Avoid unnecessary suggestions
- Avoid generic feedback
- Prioritize actionable engineering feedback

---

# 4. Service Contracts

# github.service.ts

```ts
getPullRequestFiles(owner: string, repo: string, pullNumber: number)

createPullRequestComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
)

verifyWebhookSignature(
  signature: string,
  payload: string
)
```

---

# openai.service.ts

```ts
generateReview(prompt: string)
```

---

# review.service.ts

```ts
processPullRequestReview(payload: GithubWebhookDto)

createPendingReview()

markReviewCompleted()

markReviewFailed()
```

---

# comment.service.ts

```ts
buildGithubComment(reviewResult: AIReviewResponse)
```

---

# 5. Review Processing Sequence

```txt
Webhook received
    ↓
Validate GitHub signature
    ↓
Check supported event
    ↓
Create pending review record
    ↓
Fetch PR changed files
    ↓
Filter unsupported files
    ↓
Build AI prompt
    ↓
Generate AI review
    ↓
Parse AI JSON response
    ↓
Save review result
    ↓
Post GitHub PR comment
    ↓
Mark review completed
```

---

# 6. DTO Definitions

# GithubWebhookDto

```ts
interface GithubWebhookDto {
  action: string;
  repository: {
    full_name: string;
  };
  pull_request: {
    number: number;
    title: string;
    body: string;
    user: {
      login: string;
    };
  };
}
```

---

# ReviewIssueDto

```ts
interface ReviewIssueDto {
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  category:
    | 'SECURITY'
    | 'VALIDATION'
    | 'CLEAN_CODE'
    | 'PERFORMANCE'
    | 'BUG_RISK';
  message: string;
  suggestion: string;
  filePath?: string;
  line?: number;
}
```

---

# AIReviewResponse

```ts
interface AIReviewResponse {
  summary: string;
  issues: ReviewIssueDto[];
}
```

---

# 7. Prisma Production Schema

```prisma
model Review {
  id            String           @id @default(cuid())
  repoName      String
  prNumber      Int
  prTitle       String
  author        String
  status        ReviewStatus
  aiSummary     String?
  errorMessage  String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  comments      ReviewComment[]

  @@index([repoName])
  @@index([prNumber])
}

model ReviewComment {
  id          String           @id @default(cuid())
  reviewId    String
  severity    Severity
  category    ReviewCategory
  message     String
  suggestion  String
  filePath    String?
  line        Int?

  review      Review @relation(fields: [reviewId], references: [id])

  @@index([reviewId])
}

enum ReviewStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum Severity {
  LOW
  MEDIUM
  HIGH
}

enum ReviewCategory {
  SECURITY
  VALIDATION
  CLEAN_CODE
  PERFORMANCE
  BUG_RISK
}
```

---

# 8. Coding Standards

Mandatory engineering rules:

- Use TypeScript strict mode
- Use async/await only
- Avoid business logic inside controllers
- Controllers must remain thin
- Use service layer architecture
- Use repository pattern for DB access
- Use centralized error handling only
- Use environment validation
- Use consistent naming conventions
- Avoid duplicated logic
- All external APIs must have try/catch
- Use typed DTOs/interfaces
- Use ESLint + Prettier

---

# 9. Exact Tech Decisions

The backend MUST use:

- Node.js 20
- pnpm
- ExpressJS
- Prisma ORM
- PostgreSQL
- Axios for HTTP requests
- Zod for validation
- dotenv for environment loading
- Pino logger
- ESLint
- Prettier

Optional:
- Redis
- BullMQ
- Docker

---

# 10. Prompt Engineering Rules

The OpenAI prompt MUST instruct the model to:

- return only valid JSON
- avoid markdown formatting
- avoid generic suggestions
- prioritize actionable feedback
- keep summaries concise
- focus on backend engineering issues
- detect possible race conditions
- detect missing validation
- detect security concerns
- avoid hallucinating missing context

---

# 11. Diff Filtering Rules

The system SHOULD ignore:

- package-lock.json
- pnpm-lock.yaml
- yarn.lock
- dist/
- build/
- node_modules/
- generated files
- binary files
- files larger than 500 lines

---

# 12. Token & Size Limits

To reduce AI cost and avoid token overflow:

- Maximum total diff size: 20,000 characters
- Maximum files analyzed per review: 15
- Skip extremely large patches
- Truncate oversized files safely

---

# 13. Error Handling Strategy

# OpenAI Failure

If OpenAI request fails:

- mark review as FAILED
- save error message
- log full error
- allow retry endpoint

---

# GitHub API Failure

If GitHub API fails:

- retry once
- log error
- mark review FAILED if retry also fails

---

# Invalid AI JSON

If AI returns invalid JSON:

- log invalid response
- mark review FAILED
- avoid crashing process

---

# 14. Logging Rules

The system MUST log:

```txt
Webhook received
Signature verified
Fetching PR files
Generating AI review
Saving review
Posting GitHub comment
Review completed
```

---

# Error Logs MUST Include

- timestamp
- error message
- stack trace
- PR number
- repository name

---

# 15. Environment Validation

Use Zod for environment validation.

Required variables:

```env
PORT=
DATABASE_URL=
OPENAI_API_KEY=
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=
```

The application MUST fail fast if required environment variables are missing.

---

# 16. Non-Functional Requirements

The backend MUST be:

- modular
- maintainable
- scalable
- readable
- production-oriented
- easy to extend
- strongly typed
- properly layered

---

# 17. Architectural Constraints

The project MUST NOT:

- use microservices
- use GraphQL
- use serverless architecture
- include authentication system
- include RBAC
- include unnecessary abstractions
- overengineer small features

The goal is a clean monolithic backend architecture.

---

# 18. Queue Architecture (Optional Advanced)

Optional scalable flow:

```txt
Webhook
   ↓
Queue
   ↓
Worker
   ↓
AI Review
```

Suggested stack:

- Redis
- BullMQ

Benefits:

- avoid webhook timeout
- async processing
- retry failed jobs
- scalable architecture

---

# 19. Commit Standards

Recommended commit style:

```bash
git commit -m "init express typescript backend"
git commit -m "setup prisma and postgres"
git commit -m "implement github webhook"
git commit -m "integrate openai review engine"
```

Commits should be:

- small
- incremental
- descriptive
- focused on one responsibility

---

# 20. AI Agent Coding Expectations

The AI coding agent should:

- generate production-quality TypeScript
- prioritize maintainability
- avoid unnecessary complexity
- use clear naming conventions
- keep controllers thin
- use dependency separation
- use centralized error handling
- avoid hardcoded values
- generate reusable utilities
- prefer readability over cleverness

---

# 21. Final Engineering Goal

The final backend should feel like:

```txt
A real internal engineering productivity tool
```

instead of:

```txt
A tutorial CRUD application
```
