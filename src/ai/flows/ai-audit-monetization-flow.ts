
/**
 * @fileOverview A Genkit flow for auditing monetized network transactions (Locked Posts & Subscriptions).
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const MonetizationAuditInputSchema = z.object({
  type: z.enum(['LOCK_UNLOCK', 'SUBSCRIPTION']),
  userBalance: z.number().describe('The current balance of the user.'),
  cost: z.number().describe('The cost of the transaction.'),
  currencyType: z.enum(['GOLD', 'DIAMOND']).describe('The type of currency being used.'),
  creatorUsername: z.string().describe('The creator receiving the funds.'),
});

const MonetizationAuditOutputSchema = z.object({
  approved: z.boolean().describe('Whether the transaction is approved.'),
  message: z.string().describe('A system message explaining the decision.'),
  auditToken: z.string().describe('A secure transaction token if approved.'),
  payoutAmount: z.number().describe('The amount to be sent to the creator (70%).'),
});

export async function aiAuditMonetizationHandshake(input: z.infer<typeof MonetizationAuditInputSchema>) {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are the ViMore Economy Auditor. 
        Validate monetized node handshakes.
        
        RULES:
        1. If userBalance >= cost, approved is true.
        2. payoutAmount MUST be exactly 70% of cost.
        3. If denied, message: "Insufficient Energy Buy Currency and sync again".
        
        Return ONLY a JSON object with:
        - "approved": boolean
        - "message": A cryptic, high-velocity confirmation or denial.
        - "auditToken": A 16-character hex code starting with 'MT-' if approved.
        - "payoutAmount": (cost * 0.7)`
      },
      {
        role: 'user',
        content: `Audit Request: ${JSON.stringify(input)}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return result as z.infer<typeof MonetizationAuditOutputSchema>;
}
