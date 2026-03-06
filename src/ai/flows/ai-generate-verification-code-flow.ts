'use server';

import { getGroq } from '@/ai/genkit';

/**
 * @fileOverview Standard function for generating verification codes using Groq.
 */

export async function aiGenerateVerificationCode(input: { packageName: string }) {
  const groq = getGroq();
  
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a security protocol engine for ViMore. Generate a unique, random 6-character alphanumeric code (uppercase letters and numbers). Return only a JSON object with a "code" field.'
        },
        {
          role: 'user',
          content: `Generate code for package: ${input.packageName}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    const result = JSON.parse(content || '{}');
    return { code: result.code || Math.random().toString(36).substring(2, 8).toUpperCase() };
  } catch (error) {
    return { code: Math.random().toString(36).substring(2, 8).toUpperCase() };
  }
}
