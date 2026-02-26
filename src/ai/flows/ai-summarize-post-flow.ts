/**
 * @fileOverview A Genkit flow for summarizing user post content using Groq.
 */

import {ai, groq} from '@/ai/genkit';
import {z} from 'genkit';

const AiSummarizePostInputSchema = z.object({
  postContent: z.string().describe('The full content of the user\'s post.'),
});
export type AiSummarizePostInput = z.infer<typeof AiSummarizePostInputSchema>;

const AiSummarizePostOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the post content.'
    ),
});
export type AiSummarizePostOutput = z.infer<typeof AiSummarizePostOutputSchema>;

export async function aiSummarizePost(
  input: AiSummarizePostInput
): Promise<AiSummarizePostOutput> {
  return aiSummarizePostFlow(input);
}

const aiSummarizePostFlow = ai.defineFlow(
  {
    name: 'aiSummarizePostFlow',
    inputSchema: AiSummarizePostInputSchema,
    outputSchema: AiSummarizePostOutputSchema,
  },
  async (input) => {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Summarize the following post content concisely, focusing on the main points for a social media caption. Return only a JSON object with a "summary" string field.',
        },
        {
          role: 'user',
          content: input.postContent,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"summary": "Could not generate summary."}');
    return result;
  }
);
