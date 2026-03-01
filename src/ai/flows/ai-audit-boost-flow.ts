/**
 * @fileOverview A Genkit flow for auditing and authorizing content boost campaigns.
 */

import {ai, getGroq} from '@/ai/genkit';
import {z} from 'genkit';

const BoostAuditInputSchema = z.object({
  userBalance: z.number().describe('The current balance of the user in the selected currency.'),
  boostCost: z.number().describe('The cost of the selected boost package.'),
  currencyType: z.enum(['STAR', 'DIAMOND']).describe('The type of currency being used.'),
  durationDays: z.number().describe('How many days the boost will last (3-15).'),
});

const BoostAuditOutputSchema = z.object({
  approved: z.boolean().describe('Whether the transaction is approved.'),
  promisedViews: z.number().describe('The total views the AI manager guarantees.'),
  strategy: z.string().describe('The AI campaign manager strategy for this node.'),
  message: z.string().describe('A system message explaining the decision.'),
  auditToken: z.string().describe('A secure transaction token if approved.'),
});

export async function aiAuditBoostHandshake(input: z.infer<typeof BoostAuditInputSchema>) {
  const groq = getGroq();
  
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are the ViMore Campaign Auditor & Manager.
        
        RULES:
        1. If userBalance >= boostCost, approved is true.
        2. Min Boost: 25 Diamonds or 30,000 Stars for 3 days = 10,000 views.
        3. Max Boost: 100 Diamonds or 120,000 Stars for 15 days = (Price/MinPrice) * 10,000 views + Duration Bonus.
        4. promisedViews must be at least 10,000.
        
        Return ONLY a JSON object with:
        - "approved": boolean
        - "promisedViews": number
        - "strategy": A cryptic, high-velocity manager strategy (e.g., "Cluster throttling active").
        - "message": A confirmation or denial message.
        - "auditToken": A random 16-character code starting with 'BST-' if approved.`
      },
      {
        role: 'user',
        content: `Boost Request: ${JSON.stringify(input)}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return result as z.infer<typeof BoostAuditOutputSchema>;
}
