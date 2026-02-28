
/**
 * @fileOverview A Genkit flow for auditing digital gift transactions using Groq AI.
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const GiftAuditInputSchema = z.object({
  userBalance: z.number().describe('The current balance of the user.'),
  giftCost: z.number().describe('The cost of the selected gift.'),
  currencyType: z.enum(['GOLD', 'DIAMOND']).describe('The type of currency being used.'),
});

const GiftAuditOutputSchema = z.object({
  approved: z.boolean().describe('Whether the transaction is approved based on balance.'),
  message: z.string().describe('A message explaining the decision.'),
  auditToken: z.string().describe('A secure transaction token if approved.'),
});

export async function aiAuditGiftHandshake(input: z.infer<typeof GiftAuditInputSchema>) {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are the ViMore Financial Auditor. 
        Your task is to validate if a user has enough currency to send a digital gift.
        
        RULES:
        1. If userBalance >= giftCost, approved is true.
        2. If userBalance < giftCost, approved is false.
        
        Return ONLY a JSON object with:
        - "approved": boolean
        - "message": A short, cryptic, high-velocity message. If denied, use: "Insufficient Balance Buy Currency and try again".
        - "auditToken": A random 16-character hex code starting with 'TX-' if approved, empty string if denied.`
      },
      {
        role: 'user',
        content: `Audit Request: ${JSON.stringify(input)}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return result as z.infer<typeof GiftAuditOutputSchema>;
}
