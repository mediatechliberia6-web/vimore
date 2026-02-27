/**
 * @fileOverview A Genkit flow for summarizing comment threads using Groq.
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommentsInputSchema = z.object({
  comments: z.array(z.string()).describe('The text content of the comments to summarize.'),
});
export type SummarizeCommentsInput = z.infer<typeof SummarizeCommentsInputSchema>;

const SummarizeCommentsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the community sentiment.'),
});
export type SummarizeCommentsOutput = z.infer<typeof SummarizeCommentsOutputSchema>;

export async function aiSummarizeComments(input: SummarizeCommentsInput): Promise<SummarizeCommentsOutput> {
  return aiSummarizeCommentsFlow(input);
}

const aiSummarizeCommentsFlow = ai.defineFlow(
  {
    name: 'aiSummarizeCommentsFlow',
    inputSchema: SummarizeCommentsInputSchema,
    outputSchema: SummarizeCommentsOutputSchema,
  },
  async (input) => {
    const groq = getGroq();
    const commentsText = input.comments.join('\n- ');
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are the ViMore Community Pulse Auditor. Summarize the following comment thread into a single, high-velocity sentence that captures the main sentiment or vibe of the discussion. Use a professional but modern tone. Return only a JSON object with a "summary" string field.',
        },
        {
          role: 'user',
          content: `Comments to analyze:\n- ${commentsText}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"summary": "The community is currently quiet on this node."}');
    return result;
  }
);
