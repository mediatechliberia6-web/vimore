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
  } catch (error) {
    console.error("Boost Audit Error:", error);
    const approved = input.userBalance >= input.boostCost;
    return {
      approved,
      promisedViews: Math.round((input.boostCost / (input.currencyType === 'DIAMOND' ? 25 : 30000)) * 10000),
      strategy: "Heuristic fallback active. Direct node prioritization.",
      message: approved ? "Boost handshake authorized via fallback protocol." : "Insufficient energy for boost. Top up in Currency Hub.",
      auditToken: approved ? "BST-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : ""
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
  } catch (error) {
    console.error("Sentiment Analysis Error:", error);
    return {
      score: 75,
      vibe: 'POSITIVE' as const,
      summary: "Protocol fallback: Network vibe stable and synchronized."
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
  } catch (error) {
    console.error("Monetization Audit Error:", error);
    const approved = input.userBalance >= input.cost;
    return {
      approved,
      message: approved ? "Handshake protocol fallback initiated." : "Insufficient Energy Buy Currency and sync again",
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
  } catch (error) {
    console.error("Gift Audit Error:", error);
    // Secure Fallback
    const approved = input.userBalance >= input.giftCost;
    return {
      approved,
      message: approved ? "Handshake protocol fallback initiated. Transaction valid." : "Insufficient Balance Buy Currency and try again",
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
  } catch (error) {
    console.error("Comment Summarization Error:", error);
    return { summary: "Discussion pulse is too complex for immediate analysis." };
  }
}

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
