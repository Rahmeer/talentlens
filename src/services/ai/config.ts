/**
 * AI configuration — single source of truth for model settings.
 * Change model, temperature, or provider here.
 */
export const AI_CONFIG = {
  provider: "groq" as const,
  model: "llama-3.3-70b-versatile",
  temperature: 0.1,
  maxTokens: 4096,
  maxRetries: 2,
  promptVersion: "v1.0",
} as const;
