/**
 * @fileOverview A Genkit flow for generating unique, high-velocity verification codes using Groq.
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  packageName: z.string().describe('The name of the package being purchased.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('A 6-character alphanumeric code.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function aiGenerateVerificationCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return aiGenerateVerificationCodeFlow(input);
}

const aiGenerateVerificationCodeFlow = ai.defineFlow(
  {
    name: 'aiGenerateVerificationCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async (input) => {
    const groq = getGroq();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a security protocol engine for ViMore. Generate a unique, random 6-character alphanumeric code (uppercase letters and numbers). Return only a JSON object with a "code" field.',
        },
        {
          role: 'user',
          content: `Generate code for package: ${input.packageName}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"code": "X9K2L1"}');
    return result;
  }
);
