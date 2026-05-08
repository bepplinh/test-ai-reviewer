import { AIReviewResponse } from '../types/review.types';

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

Rules:
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
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
  prBody: string,
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
      "category": "SECURITY | VALIDATION | CLEAN_CODE | PERFORMANCE | BUG_RISK",
      "message": "string",
      "suggestion": "string",
      "filePath": "string or null",
      "line": number or null
    }
  ]
}`;
}

// ============================================================
// Validate and parse AI response
// ============================================================
export function parseAIResponse(rawResponse: string): AIReviewResponse {
  const parsed = JSON.parse(rawResponse);

  if (
    typeof parsed.summary !== 'string' ||
    !Array.isArray(parsed.issues)
  ) {
    throw new Error('AI response does not match expected schema');
  }

  return parsed as AIReviewResponse;
}
