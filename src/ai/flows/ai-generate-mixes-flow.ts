
/**
 * @fileOverview A Genkit flow for generating creative music mix titles using Groq.
 */

import {ai, getGroq} from '@/ai/genkit';
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

const aiGenerateDailyMixesFlow = ai.defineFlow(
  {
    name: 'aiGenerateDailyMixesFlow',
    inputSchema: GenerateMixesInputSchema,
    outputSchema: GenerateMixesOutputSchema,
  },
  async (input) => {
    const groq = getGroq();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a music curator for a premium streaming service. Based on the vibe provided, generate 6 unique, creative, and short playlist titles (max 3 words each). Return only a JSON object with a "mixes" array of strings.',
        },
        {
          role: 'user',
          content: `Vibe: ${input.vibe}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"mixes": []}');
    return result;
  }
);
