'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for auditing monetized network transactions using Groq.
 */

export async function aiAuditMonetizationHandshake(input: { type: 'LOCK_UNLOCK' | 'SUBSCRIPTION', userBalance: number, cost: number, currencyType: 'GOLD' | 'DIAMOND', creatorUsername: string }) {
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

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{}');
}
