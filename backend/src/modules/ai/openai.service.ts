import { openaiClient } from '../../config/openai';
import { SYSTEM_PROMPT } from './prompt.templates';
import { AIReviewResponse } from './ai.types';
import { logger } from '../../shared/utils/logger';

/**
 * Sends the review prompt to OpenAI and returns structured result with usage info.
 */
export async function generateReview(prompt: string): Promise<{
  result: AIReviewResponse;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number; cost: number };
}> {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  
  logger.info({ model }, 'Generating AI review');

  const response = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const rawContent = response.choices[0]?.message?.content;
  const usage = response.usage;

  if (!rawContent || !usage) {
    throw new Error('OpenAI returned an empty response or missing usage data');
  }

  // Basic cost calculation for gpt-4o-mini
  // Prices: $0.150 / 1M input, $0.600 / 1M output
  const inputTokens = usage.prompt_tokens;
  const outputTokens = usage.completion_tokens;
  const cost = (inputTokens * 0.15 + outputTokens * 0.6) / 1_000_000;

  const result = JSON.parse(rawContent) as AIReviewResponse;

  // Schema validation
  if (typeof result.summary !== 'string' || !Array.isArray(result.issues)) {
    throw new Error('AI response does not match expected schema');
  }

  return {
    result,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: usage.total_tokens,
      cost,
    },
  };
}
