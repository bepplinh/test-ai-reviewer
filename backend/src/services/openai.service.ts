import { openaiClient } from '../config/openai';
import { SYSTEM_PROMPT } from '../prompts/review.prompt';
import { AIReviewResponse } from '../types/review.types';
import { logger } from '../utils/logger';

/**
 * Sends the review prompt to OpenAI and returns a structured review result.
 */
export async function generateReview(prompt: string): Promise<AIReviewResponse> {
  logger.info('Generating AI review');

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const rawContent = response.choices[0]?.message?.content;

  if (!rawContent) {
    throw new Error('OpenAI returned an empty response');
  }

  logger.info('AI review generated successfully');

  const parsed = JSON.parse(rawContent) as AIReviewResponse;

  if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.issues)) {
    throw new Error('AI response does not match expected schema');
  }

  return parsed;
}
