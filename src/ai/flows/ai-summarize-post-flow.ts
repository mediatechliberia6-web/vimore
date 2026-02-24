'use server';
/**
 * @fileOverview A Genkit flow for summarizing user post content.
 *
 * - aiSummarizePost - A function that handles the post summarization process.
 * - AiSummarizePostInput - The input type for the aiSummarizePost function.
 * - AiSummarizePostOutput - The return type for the aiSummarizePost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSummarizePostInputSchema = z.object({
  postContent: z.string().describe('The full content of the user\'s post.'),
});
export type AiSummarizePostInput = z.infer<typeof AiSummarizePostInputSchema>;

const AiSummarizePostOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the post content, suitable for a social media caption or message.'
    ),
});
export type AiSummarizePostOutput = z.infer<typeof AiSummarizePostOutputSchema>;

export async function aiSummarizePost(
  input: AiSummarizePostInput
): Promise<AiSummarizePostOutput> {
  return aiSummarizePostFlow(input);
}

const summarizePostPrompt = ai.definePrompt({
  name: 'summarizePostPrompt',
  input: {schema: AiSummarizePostInputSchema},
  output: {schema: AiSummarizePostOutputSchema},
  prompt: `Summarize the following post content concisely, focusing on the main points for a social media caption or message. Keep it brief and engaging.

Post Content:
{{{postContent}}}`,
});

const aiSummarizePostFlow = ai.defineFlow(
  {
    name: 'aiSummarizePostFlow',
    inputSchema: AiSummarizePostInputSchema,
    outputSchema: AiSummarizePostOutputSchema,
  },
  async (input) => {
    const {output} = await summarizePostPrompt(input);
    return output!;
  }
);
