import { env } from './env';
import OpenAI from 'openai';

export const openaiClient = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
