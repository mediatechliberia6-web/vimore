import {genkit} from 'genkit';
import Groq from 'groq-sdk';

/**
 * Genkit instance for flow orchestration and schema validation.
 */
export const ai = genkit({});

/**
 * Groq client for high-velocity inference.
 */
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
