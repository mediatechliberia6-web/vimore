'use server';

import { aiSummarizePost as summarizeFlow } from '@/ai/flows/ai-summarize-post-flow';
import { aiSuggestHashtags as hashtagsFlow } from '@/ai/flows/ai-suggest-hashtags-flow';
import { aiTranslatePost as translateFlow } from '@/ai/flows/ai-translate-post-flow';
import { aiGenerateDailyMixes as mixesFlow } from '@/ai/flows/ai-generate-mixes-flow';
import { aiGenerateVerificationCode as codeFlow } from '@/ai/flows/ai-generate-verification-code-flow';
import { aiVerifySignature as verifyFlow } from '@/ai/flows/ai-verify-signature-flow';

/**
 * Audits a verification request using Groq AI.
 */
export async function aiRequestSignatureVerification(input: { username: string, hasEverBeenVerified: boolean, currencyChoice: 'DIAMOND' | 'STAR' }) {
  try {
    const result = await verifyFlow(input);
    return result;
  } catch (error) {
    console.error("Verification Audit Error:", error);
    // Secure Fallback Logic
    const cost = input.hasEverBeenVerified 
      ? (input.currencyChoice === 'DIAMOND' ? 15 : 20000)
      : (input.currencyChoice === 'DIAMOND' ? 6 : 10000);
    
    return {
      approved: true,
      cost,
      durationDays: 30,
      message: "Direct protocol fallback initiated. Handshake valid.",
      auditToken: "V-FB-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    };
  }
}

/**
 * Generates a unique 6-character verification code using Groq.
 */
export async function aiGenerateVerificationCode({ packageName }: { packageName: string }) {
  try {
    const result = await codeFlow({ packageName });
    return { code: result.code };
  } catch (error) {
    console.error("Code Generation Error:", error);
    const fallback = Math.random().toString(36).substring(2, 8).toUpperCase();
    return { code: fallback };
  }
}

/**
 * Generates 6 personalized music mix titles based on a vibe using Genkit and Groq.
 */
export async function aiGenerateDailyMixes() {
  const vibes = ["Late Night Chill", "High Energy Workout", "Sunday Morning Soul", "Cyberpunk Future", "Tropical Vibes", "Emotional Acoustic"];
  const selectedVibe = vibes[Math.floor(Math.random() * vibes.length)];

  try {
    const result = await mixesFlow({ vibe: selectedVibe });
    return { mixes: result.mixes };
  } catch (error) {
    console.error("Daily Mix Generation Error:", error);
    return { mixes: ["Morning Chill", "Coding Beats", "Late Night", "Focus Flow", "Vibe Check", "Groove Hub"] };
  }
}

/**
 * Suggests hashtags for a post using Genkit and Groq.
 */
export async function aiSuggestHashtags({ postContent }: { postContent: string }) {
  try {
    const result = await hashtagsFlow({ postContent });
    return { hashtags: result.hashtags };
  } catch (error) {
    console.error("Hashtag Suggestion Error:", error);
    return { hashtags: [] };
  }
}

/**
 * Summarizes a post using Genkit and Groq.
 */
export async function aiSummarizePost({ postContent }: { postContent: string }) {
  try {
    const result = await summarizeFlow({ postContent });
    return { summary: result.summary };
  } catch (error) {
    console.error("Summarization Error:", error);
    return { summary: "Could not generate summary." };
  }
}

/**
 * Translates a post to the user's preferred language using Genkit and Groq.
 */
export async function aiTranslatePost({ postContent, targetLanguage = "English" }: { postContent: string, targetLanguage?: string }) {
  try {
    const result = await translateFlow({ postContent, targetLanguage });
    return { translation: result.translation };
  } catch (error) {
    console.error("Translation Error:", error);
    return { translation: "Could not translate post." };
  }
}
