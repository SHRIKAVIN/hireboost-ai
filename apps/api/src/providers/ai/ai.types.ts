export interface AiGenerateInput {
  system: string;
  user: string;
}

/** Minimal contract for Phase 8 — JSON-only model output. */
export interface AiClient {
  generateStructuredJson(input: AiGenerateInput): Promise<string>;
}
