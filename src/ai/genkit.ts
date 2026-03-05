
import 'server-only';
import {genkit} from 'genkit';
import Groq from 'groq-sdk';

/**
 * Genkit instance for flow orchestration and schema validation.
 */
export const ai = genkit({});

/**
 * Lazy-initialized Groq client for high-velocity inference.
 * Includes a Diagnostic Handshake to check for API key presence.
 */
export function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("AI PROTOCOL CRITICAL: GROQ_API_KEY node is missing from environment variables.");
  }

  return new Groq({
    apiKey: apiKey || 'MISSING_KEY',
  });
}
