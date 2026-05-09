import { geminiClient } from '../../config/gemini';
import { SYSTEM_PROMPT } from './prompt.templates';
import { AIReviewResponse } from './ai.types';
import { logger } from '../../shared/utils/logger';
import { env } from '../../config/env';

/**
 * Sends the review prompt to Google Gemini and returns structured result with usage info.
 * Uses the free-tier compatible gemini-1.5-flash model by default.
 */
export async function generateReview(prompt: string): Promise<{
  result: AIReviewResponse;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number; cost: number };
}> {
  const modelName = env.GEMINI_MODEL;

  logger.info({ model: modelName }, 'Generating AI review');

  const model = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const response = await model.generateContent(prompt);
  const rawContent = response.response.text();
  const usageMeta = response.response.usageMetadata;

  if (!rawContent) {
    throw new Error('Gemini returned an empty response');
  }

  const inputTokens = usageMeta?.promptTokenCount ?? 0;
  const outputTokens = usageMeta?.candidatesTokenCount ?? 0;
  const totalTokens = usageMeta?.totalTokenCount ?? inputTokens + outputTokens;

  // Gemini 1.5 Flash is free-tier: cost = $0 for low usage
  // For accurate pricing reference: https://ai.google.dev/pricing
  const cost = 0;

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
      totalTokens,
      cost,
    },
  };
}
