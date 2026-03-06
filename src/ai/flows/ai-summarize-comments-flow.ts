'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for summarizing comment threads using Groq.
 */

export async function aiSummarizeComments(input: { comments: string[] }) {
  const groq = getGroq();
  const commentsText = input.comments.join('\n- ');
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are the ViMore Community Pulse Auditor. Summarize the following comment thread into a single, high-velocity sentence that captures the main sentiment or vibe of the discussion. Use a professional but modern tone. Return only a JSON object with a "summary" string field.'
      },
      {
        role: 'user',
        content: `Comments to analyze:\n- ${commentsText}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{"summary": "The community is currently quiet on this node."}');
}
