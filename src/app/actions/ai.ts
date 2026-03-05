
'use server';

import { aiSummarizePost as summarizeFlow } from '@/ai/flows/ai-summarize-post-flow';
import { aiSuggestHashtags as hashtagsFlow } from '@/ai/flows/ai-suggest-hashtags-flow';
import { aiTranslatePost as translateFlow } from '@/ai/flows/ai-translate-post-flow';
import { aiGenerateDailyMixes as mixesFlow } from '@/ai/flows/ai-generate-mixes-flow';
import { aiGenerateVerificationCode as codeFlow } from '@/ai/flows/ai-generate-verification-code-flow';
import { aiVerifySignature as verifyFlow } from '@/ai/flows/ai-verify-signature-flow';
import { aiSummarizeComments as commentsFlow } from '@/ai/flows/ai-summarize-comments-flow';
import { aiAuditGiftHandshake as auditFlow } from '@/ai/flows/ai-audit-gift-flow';
import { aiAuditMonetizationHandshake as monetizationFlow } from '@/ai/flows/ai-audit-monetization-flow';
import { aiAnalyzeGlobalSentiment as sentimentFlow } from '@/ai/flows/ai-analyze-sentiment-flow';
import { aiAuditBoostHandshake as boostFlow } from '@/ai/flows/ai-audit-boost-flow';

/**
 * Audits a boost campaign request using Groq AI.
 */
export async function aiAuditBoostHandshake(input: { userBalance: number, boostCost: number, currencyType: 'STAR' | 'DIAMOND', durationDays: number }) {
  try {
    const result = await boostFlow(input);
    return result;
  } catch (error: any) {
    console.error("BOOST AUDIT DIAGNOSTIC:", error.message);
    const approved = input.userBalance >= input.boostCost;
    return {
      approved,
      promisedViews: Math.round((input.boostCost / (input.currencyType === 'DIAMOND' ? 25 : 30000)) * 10000),
      strategy: "Heuristic fallback active. Direct node prioritization.",
      message: approved ? "Boost authorized via fallback. (Note: AI Node was unreachable)" : "Insufficient energy for boost.",
      auditToken: approved ? "BST-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : "",
      diagnosticError: error.message
    };
  }
}

/**
 * Analyzes the collective vibe of the network using Groq.
 */
export async function aiAnalyzeGlobalSentiment({ messages }: { messages: string[] }) {
  try {
    const result = await sentimentFlow({ messages });
    return result;
  } catch (error: any) {
    console.error("SENTIMENT ANALYSIS DIAGNOSTIC:", error.message);
    return {
      score: 75,
      vibe: 'POSITIVE' as const,
      summary: "Protocol fallback: Network vibe stable. (Diagnostic: " + error.message + ")"
    };
  }
}

/**
 * Audits a monetization transaction (Locked Post or Subscription).
 */
export async function aiAuditMonetizationHandshake(input: { type: 'LOCK_UNLOCK' | 'SUBSCRIPTION', userBalance: number, cost: number, currencyType: 'GOLD' | 'DIAMOND', creatorUsername: string }) {
  try {
    const result = await monetizationFlow(input);
    return result;
  } catch (error: any) {
    console.error("MONETIZATION AUDIT DIAGNOSTIC:", error.message);
    const approved = input.userBalance >= input.cost;
    return {
      approved,
      message: approved ? "Handshake protocol fallback initiated." : "Insufficient Energy. (Diagnostic: " + error.message + ")",
      auditToken: approved ? "MT-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : "",
      payoutAmount: input.cost * 0.7
    };
  }
}

/**
 * Audits a gift transaction using Groq AI.
 */
export async function aiAuditGiftHandshake(input: { userBalance: number, giftCost: number, currencyType: 'GOLD' | 'DIAMOND' }) {
  try {
    const result = await auditFlow(input);
    return result;
  } catch (error: any) {
    console.error("GIFT AUDIT DIAGNOSTIC:", error.message);
    const approved = input.userBalance >= input.giftCost;
    return {
      approved,
      message: approved ? "Fallback handshake established." : "Insufficient Balance. (Diagnostic: " + error.message + ")",
      auditToken: approved ? "TX-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : ""
    };
  }
}

/**
 * Summarizes a thread of comments using Groq.
 */
export async function aiSummarizeComments({ comments }: { comments: string[] }) {
  try {
    const result = await commentsFlow({ comments });
    return { summary: result.summary };
  } catch (error: any) {
    console.error("COMMENT SUMMARIZATION DIAGNOSTIC:", error.message);
    return { summary: "Discussion pulse too complex. Error: " + error.message };
  }
}

/**
 * Audits a verification request using Groq AI.
 */
export async function aiRequestSignatureVerification(input: { username: string, hasEverBeenVerified: boolean, currencyChoice: 'DIAMOND' | 'STAR' }) {
  try {
    const result = await verifyFlow(input);
    return result;
  } catch (error: any) {
    console.error("VERIFICATION AUDIT DIAGNOSTIC:", error.message);
    const cost = input.hasEverBeenVerified 
      ? (input.currencyChoice === 'DIAMOND' ? 15 : 20000)
      : (input.currencyChoice === 'DIAMOND' ? 6 : 10000);
    
    return {
      approved: true,
      cost,
      durationDays: 30,
      message: "Direct protocol fallback initiated. (Diagnostic: " + error.message + ")",
      auditToken: "V-FB-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    };
  }
}

/**
 * Generates a unique 6-character verification code using Groq with Hardware Fallback.
 */
export async function aiGenerateVerificationCode({ packageName }: { packageName: string }) {
  try {
    const result = await codeFlow({ packageName });
    if (!result || !result.code) throw new Error("Null pulse from AI Engine");
    return { code: result.code };
  } catch (error: any) {
    console.warn("AI CODE GENERATION DIAGNOSTIC:", error.message);
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
  } catch (error: any) {
    console.error("DAILY MIX DIAGNOSTIC:", error.message);
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
  } catch (error: any) {
    console.error("HASHTAG SUGGESTION DIAGNOSTIC:", error.message);
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
  } catch (error: any) {
    console.error("POST SUMMARIZATION DIAGNOSTIC:", error.message);
    return { summary: "Summarization pulse failed: " + error.message };
  }
}

/**
 * Translates a post to the user's preferred language using Genkit and Groq.
 */
export async function aiTranslatePost({ postContent, targetLanguage = "English" }: { postContent: string, targetLanguage?: string }) {
  try {
    const result = await translateFlow({ postContent, targetLanguage });
    return { translation: result.translation };
  } catch (error: any) {
    console.error("TRANSLATION DIAGNOSTIC:", error.message);
    return { translation: "Translation pulse failed: " + error.message };
  }
}
