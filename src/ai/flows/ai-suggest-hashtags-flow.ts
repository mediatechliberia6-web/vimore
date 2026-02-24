'use server';
/**
 * @fileOverview A Genkit flow for suggesting relevant hashtags based on post content.
 *
 * - aiSuggestHashtags - A function that handles the hashtag suggestion process.
 * - SuggestHashtagsInput - The input type for the aiSuggestHashtags function.
 * - SuggestHashtagsOutput - The return type for the aiSuggestHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHashtagsInputSchema = z.object({
  postContent: z.string().describe('The content of the user\'s post.'),
});
export type SuggestHashtagsInput = z.infer<typeof SuggestHashtagsInputSchema>;

const SuggestHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe('An array of relevant hashtags suggested for the post content.'),
});
export type SuggestHashtagsOutput = z.infer<typeof SuggestHashtagsOutputSchema>;

export async function aiSuggestHashtags(
  input: SuggestHashtagsInput
): Promise<SuggestHashtagsOutput> {
  return aiSuggestHashtagsFlow(input);
}

const suggestHashtagsPrompt = ai.definePrompt({
  name: 'suggestHashtagsPrompt',
  input: {schema: SuggestHashtagsInputSchema},
  output: {schema: SuggestHashtagsOutputSchema},
  prompt: `You are a social media expert specializing in maximizing post discoverability through relevant hashtags.

Based on the following post content, suggest 5-10 highly relevant and popular hashtags.
Do not include any other text or explanation, just the JSON array of hashtags.

Post content: """{{{postContent}}}"""
`,
});

const aiSuggestHashtagsFlow = ai.defineFlow(
  {
    name: 'aiSuggestHashtagsFlow',
    inputSchema: SuggestHashtagsInputSchema,
    outputSchema: SuggestHashtagsOutputSchema,
  },
  async input => {
    const {output} = await suggestHashtagsPrompt(input);
    return output!;
  }
);
