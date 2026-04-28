import { GoogleGenerativeAI } from '@google/generative-ai';

import { env } from '../../config/env.js';
import type { AiClient, AiGenerateInput } from './ai.types.js';

export class GeminiClient implements AiClient {
  async generateStructuredJson(input: AiGenerateInput): Promise<string> {
    const key = env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY missing');

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: input.system,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const res = await model.generateContent(input.user);
    const text = res.response.text();
    if (!text?.trim()) throw new Error('Empty response from Gemini');
    return text;
  }
}
