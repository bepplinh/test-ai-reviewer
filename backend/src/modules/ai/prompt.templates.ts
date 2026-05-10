import { AIReviewResponse } from './ai.types';

// ============================================================
// System Prompt
// ============================================================
export const SYSTEM_PROMPT = `You are a senior backend engineer performing a thorough code review on a GitHub Pull Request.

Your task is to identify real engineering problems in the code diff provided.

Focus on:
- Bugs and logic errors
- Missing input validation
- Security vulnerabilities (e.g., injection, exposure of secrets)
- Race conditions and concurrency issues
- Poor naming conventions
- Duplicated or redundant logic
- Performance inefficiencies
- Clean code violations
- Scalability concerns
- Maintainability issues

Rules:
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- Return STRICT JSON ONLY.
- Maximum 10 issues.
- Keep summary under 150 words.
- Only flag real, actionable issues. Avoid generic feedback.
- Do not hallucinate missing context.
- Focus on backend engineering issues.
- If no issues found, return an empty issues array.`;

// ============================================================
// Build User Prompt from PR data
// ============================================================
export function buildReviewPrompt(
  prTitle: string,
  prBody: string | null | undefined,
  fileDiffs: string
): string {
  return `Analyze the following GitHub Pull Request and generate a review.

PR Title: ${prTitle}
PR Description: ${prBody || 'No description provided.'}

Changed Files Diff:
${fileDiffs}

Return your response in EXACTLY this JSON format:
{
  "summary": "string (under 150 words)",
  "issues": [
    {
      "severity": "LOW | MEDIUM | HIGH",
      "type": "string (e.g. security, performance, bug, naming, etc.)",
      "message": "string (concise problem description)",
      "suggestion": "string (actionable fix)",
      "filePath": "string or null",
      "line": number or null
    }
  ]
}`;
}
