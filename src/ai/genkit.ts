
import 'server-only';
import {genkit} from 'genkit';
import Groq from 'groq-sdk';

/**
 * Genkit instance for flow orchestration and schema validation.
 */
export const ai = genkit({});

/**
 * Lazy-initialized Groq client for high-velocity inference.
 * This prevents initialization errors during build time.
 */
export function getGroq() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}
