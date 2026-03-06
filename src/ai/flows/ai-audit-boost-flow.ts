'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for auditing content boost campaigns using Groq.
 */

export async function aiAuditBoostHandshake(input: { userBalance: number, boostCost: number, currencyType: 'STAR' | 'DIAMOND', durationDays: number }) {
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

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{}');
}
