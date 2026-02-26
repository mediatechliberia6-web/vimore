'use server';
/**
 * @fileOverview A Genkit flow for translating post content.
 *
 * - aiTranslatePost - A function that handles the translation process.
 * - TranslatePostInput - The input type for the translation function.
 * - TranslatePostOutput - The return type for the translation function.
 */

import {ai} from '@/ai/genkit';
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

const translatePostPrompt = ai.definePrompt({
  name: 'translatePostPrompt',
  input: {schema: TranslatePostInputSchema},
  output: {schema: TranslatePostOutputSchema},
  prompt: `You are a professional translator. 
Translate the following social media post into {{targetLanguage}}. 
Maintain the original tone, emojis, and formatting.

Post Content:
"""{{{postContent}}}"""`,
});

const aiTranslatePostFlow = ai.defineFlow(
  {
    name: 'aiTranslatePostFlow',
    inputSchema: TranslatePostInputSchema,
    outputSchema: TranslatePostOutputSchema,
  },
  async (input) => {
    const {output} = await translatePostPrompt(input);
    return output!;
  }
);
