'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for suggesting hashtags using Groq.
 */

export async function aiSuggestHashtags(input: { postContent: string }) {
  const groq = getGroq();
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a social media expert. Suggest 5-10 highly relevant and popular hashtags for the post content. Return only a JSON object with a "hashtags" array of strings.'
      },
      {
        role: 'user',
        content: input.postContent
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{"hashtags": []}');
}
