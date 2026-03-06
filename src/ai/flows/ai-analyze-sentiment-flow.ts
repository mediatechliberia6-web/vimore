'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for analyzing global community sentiment using Groq.
 */

export async function aiAnalyzeGlobalSentiment(input: { messages: string[] }) {
  const groq = getGroq();
  const contentToAnalyze = input.messages.join('\n- ');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are the ViMore Network Intelligence Auditor. 
        Analyze the collective sentiment of the provided messages.
        
        Return ONLY a JSON object with:
        - "score": number (0-100, where 100 is pure positivity)
        - "vibe": "POSITIVE", "NEUTRAL", or "NEGATIVE"
        - "summary": A cryptic, professional, high-velocity summary of the network mood.`
      },
      {
        role: 'user',
        content: `Data Nodes to Analyze:\n- ${contentToAnalyze}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{}');
}
