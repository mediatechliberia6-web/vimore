
/**
 * @fileOverview A Genkit flow for suggesting relevant hashtags using Groq.
 */

import {ai, getGroq} from '@/ai/genkit';
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

const aiSuggestHashtagsFlow = ai.defineFlow(
  {
    name: 'aiSuggestHashtagsFlow',
    inputSchema: SuggestHashtagsInputSchema,
    outputSchema: SuggestHashtagsOutputSchema,
  },
  async input => {
    const groq = getGroq();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert. Suggest 5-10 highly relevant and popular hashtags for the post content. Return only a JSON object with a "hashtags" array of strings.',
        },
        {
          role: 'user',
          content: input.postContent,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"hashtags": []}');
    return result;
  }
);
