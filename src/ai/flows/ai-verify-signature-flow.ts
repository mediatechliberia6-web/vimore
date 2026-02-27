/**
 * @fileOverview A Genkit flow for auditing and authorizing verification signatures.
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const VerifySignatureInputSchema = z.object({
  username: z.string().describe('The user requesting verification.'),
  hasEverBeenVerified: z.boolean().describe('Whether this is a first-time or renewal request.'),
  currencyChoice: z.enum(['DIAMOND', 'STAR']).describe('The chosen currency for payment.'),
});
export type VerifySignatureInput = z.infer<typeof VerifySignatureInputSchema>;

const VerifySignatureOutputSchema = z.object({
  approved: z.boolean().describe('Whether the transaction logic is sound.'),
  cost: z.number().describe('The validated cost for the transaction.'),
  durationDays: z.number().describe('How many days the signature will stay active.'),
  message: z.string().describe('A system message explaining the decision.'),
  auditToken: z.string().describe('A security token for the handshake.'),
});
export type VerifySignatureOutput = z.infer<typeof VerifySignatureOutputSchema>;

export async function aiVerifySignature(input: VerifySignatureInput): Promise<VerifySignatureOutput> {
  return aiVerifySignatureFlow(input);
}

const aiVerifySignatureFlow = ai.defineFlow(
  {
    name: 'aiVerifySignatureFlow',
    inputSchema: VerifySignatureInputSchema,
    outputSchema: VerifySignatureOutputSchema,
  },
  async (input) => {
    const groq = getGroq();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are the ViMore Signature Auditor. 
          First-time verification: 6 Diamonds or 10,000 Stars. 
          Renewal/Returning: 15 Diamonds or 20,000 Stars. 
          Verification duration: 30 days.
          
          Analyze the user request and return a JSON object with:
          - "approved": true
          - "cost": (the number based on currency and history)
          - "durationDays": 30
          - "message": (a cryptic, high-velocity confirmation message)
          - "auditToken": (a random 12-character alphanumeric code starting with 'V-')`,
        },
        {
          role: 'user',
          content: `Request: ${JSON.stringify(input)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return result;
  }
);
