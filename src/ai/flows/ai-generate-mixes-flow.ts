'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for generating music mix titles using Groq.
 */

export async function aiGenerateDailyMixes(input: { vibe: string }) {
  const groq = getGroq();
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a music curator for a premium streaming service. Based on the vibe provided, generate 6 unique, creative, and short playlist titles (max 3 words each). Return only a JSON object with a "mixes" array of strings.'
      },
      {
        role: 'user',
        content: `Vibe: ${input.vibe}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{"mixes": ["Morning Chill", "Coding Beats", "Late Night", "Focus Flow", "Vibe Check", "Groove Hub"]}');
}
