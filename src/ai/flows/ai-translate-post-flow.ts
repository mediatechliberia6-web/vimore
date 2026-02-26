/**
 * @fileOverview A Genkit flow for translating post content using Groq.
 */

import {ai, groq} from '@/ai/genkit';
import {z} from 'genkit';

const TranslatePostInputSchema = z.object({
  postContent: z.string().describe('The content to translate.'),
  targetLanguage: z.string().default('English').describe('The language to translate into.'),
});
export type TranslatePostInput = z.infer<typeof TranslatePostInputSchema>;

const TranslatePostOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslatePostOutput = z.infer<typeof TranslatePostOutputSchema>;

export async function aiTranslatePost(input: TranslatePostInput): Promise<TranslatePostOutput> {
  return aiTranslatePostFlow(input);
}

const aiTranslatePostFlow = ai.defineFlow(
  {
    name: 'aiTranslatePostFlow',
    inputSchema: TranslatePostInputSchema,
    outputSchema: TranslatePostOutputSchema,
  },
  async (input) => {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the social media post into ${input.targetLanguage}. Maintain the original tone, emojis, and formatting. Return only a JSON object with a "translation" string field.`,
        },
        {
          role: 'user',
          content: input.postContent,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"translation": "Could not translate post."}');
    return result;
  }
);
