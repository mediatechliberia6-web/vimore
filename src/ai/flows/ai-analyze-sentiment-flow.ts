/**
 * @fileOverview A Genkit flow for analyzing global community sentiment using Groq AI.
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const SentimentInputSchema = z.object({
  messages: z.array(z.string()).describe('A collection of recent post contents or comments.'),
});

const SentimentOutputSchema = z.object({
  score: z.number().describe('A sentiment score from 0 to 100.'),
  vibe: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).describe('The overall classification of the vibe.'),
  summary: z.string().describe('A short, high-velocity summary of the network mood.'),
});

export async function aiAnalyzeGlobalSentiment(input: z.infer<typeof SentimentInputSchema>) {
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
        - "summary": A cryptic, professional, high-velocity summary of the mood.`
      },
      {
        role: 'user',
        content: `Data Nodes to Analyze:\n- ${contentToAnalyze}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return result as z.infer<typeof SentimentOutputSchema>;
}
