'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for auditing digital gift transactions using Groq.
 */

export async function aiAuditGiftHandshake(input: { userBalance: number, giftCost: number, currencyType: 'GOLD' | 'DIAMOND' }) {
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

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{}');
}
