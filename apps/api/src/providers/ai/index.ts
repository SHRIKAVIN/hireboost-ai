import { env } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';
import type { AiClient } from './ai.types.js';
import { GeminiClient } from './gemini.client.js';
import { OpenAiClient } from './openai.client.js';

export type { AiClient, AiGenerateInput } from './ai.types.js';

/**
 * Factory for the configured vendor (`AI_PROVIDER` env).
 * Throws `ApiError` 503 when the matching API key is missing.
 */
export function getAiClient(): AiClient {
  if (env.AI_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      throw ApiError.serviceUnavailable(
        'AI enhancement is not configured. Set OPENAI_API_KEY on the server.',
      );
    }
    return new OpenAiClient();
  }
  if (!env.GEMINI_API_KEY) {
    throw ApiError.serviceUnavailable(
      'AI enhancement is not configured. Set GEMINI_API_KEY on the server.',
    );
  }
  return new GeminiClient();
}

/** True when the active provider has a key (for health-style checks). */
export function isAiEnhancementConfigured(): boolean {
  if (env.AI_PROVIDER === 'openai') return Boolean(env.OPENAI_API_KEY);
  return Boolean(env.GEMINI_API_KEY);
}
