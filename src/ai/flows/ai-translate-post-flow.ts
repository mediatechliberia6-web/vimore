'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for translating content using Groq.
 */

export async function aiTranslatePost(input: { postContent: string, targetLanguage?: string }) {
  const groq = getGroq();
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the social media post into ${input.targetLanguage || 'English'}. Maintain the original tone, emojis, and formatting. Return only a JSON object with a "translation" string field.`
      },
      {
        role: 'user',
        content: input.postContent
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{"translation": "Could not translate post."}');
}
