import OpenAI from 'openai';

import { env } from '../../config/env.js';
import type { AiClient, AiGenerateInput } from './ai.types.js';

export class OpenAiClient implements AiClient {
  async generateStructuredJson(input: AiGenerateInput): Promise<string> {
    const key = env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY missing');

    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.35,
      max_tokens: 8192,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content?.trim()) throw new Error('Empty response from OpenAI');
    return content;
  }
}
