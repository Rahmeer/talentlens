import type { AIProvider } from "./provider";
import { GroqProvider } from "./groq-provider";
import { AI_CONFIG } from "./config";

let providerInstance: AIProvider | null = null;

/**
 * Factory function — returns the configured AI provider.
 * Swap providers by changing AI_CONFIG.provider.
 */
export function getAIProvider(): AIProvider {
  if (providerInstance) return providerInstance;

  switch (AI_CONFIG.provider) {
    case "groq":
      providerInstance = new GroqProvider();
      break;
    default:
      throw new Error(`Unknown AI provider: ${AI_CONFIG.provider}`);
  }

  return providerInstance;
}

export { AI_CONFIG } from "./config";
export type { AIProvider, CandidateData, JobData, ScreeningData } from "./provider";
