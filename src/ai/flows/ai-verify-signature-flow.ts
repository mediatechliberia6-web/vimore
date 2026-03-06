'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for auditing verification signatures using Groq.
 */

export async function aiVerifySignature(input: { username: string, hasEverBeenVerified: boolean, currencyChoice: 'DIAMOND' | 'STAR' }) {
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
        - "auditToken": (a random 12-character alphanumeric code starting with 'V-')`
      },
      {
        role: 'user',
        content: `Request: ${JSON.stringify(input)}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content || '{}');
}
