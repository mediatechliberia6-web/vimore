'use server';
/**
 * @fileOverview A Genkit flow for generating creative music mix titles.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMixesInputSchema = z.object({
  vibe: z.string().describe('The vibe to base the playlist titles on.'),
});
export type GenerateMixesInput = z.infer<typeof GenerateMixesInputSchema>;

const GenerateMixesOutputSchema = z.object({
  mixes: z.array(z.string()).describe('An array of 6 creative playlist titles.'),
});
export type GenerateMixesOutput = z.infer<typeof GenerateMixesOutputSchema>;

export async function aiGenerateDailyMixes(input: GenerateMixesInput): Promise<GenerateMixesOutput> {
  return aiGenerateDailyMixesFlow(input);
}

const generateMixesPrompt = ai.definePrompt({
  name: 'generateMixesPrompt',
  input: {schema: GenerateMixesInputSchema},
  output: {schema: GenerateMixesOutputSchema},
  prompt: `You are a music curator for a premium streaming service.
Based on the vibe "{{vibe}}", generate 6 unique, creative, and short playlist titles.
The titles should be punchy, evocative, and no more than 3 words each.`,
});

const aiGenerateDailyMixesFlow = ai.defineFlow(
  {
    name: 'aiGenerateDailyMixesFlow',
    inputSchema: GenerateMixesInputSchema,
    outputSchema: GenerateMixesOutputSchema,
  },
  async (input) => {
    const {output} = await generateMixesPrompt(input);
    return output!;
  }
);
