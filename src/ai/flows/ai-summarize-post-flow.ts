'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for summarizing post content using Groq.
 */

export async function aiSummarizePost(input: { postContent: string }) {
  const groq = getGroq();
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'Summarize the following post content concisely, focusing on the main points for a social media caption. Return only a JSON object with a "summary" string field.'
      },
      {
        role: 'user',
        content: input.postContent
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{"summary": "Could not generate summary."}');
}
