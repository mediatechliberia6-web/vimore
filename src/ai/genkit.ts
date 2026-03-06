import 'server-only';
import Groq from 'groq-sdk';

/**
 * @fileOverview ViMore AI Engine (Groq Native)
 * Provides direct access to high-velocity inference nodes.
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
