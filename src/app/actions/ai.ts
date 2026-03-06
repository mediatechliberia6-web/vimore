'use server';

import { aiSummarizePost } from '@/ai/flows/ai-summarize-post-flow';
import { aiSuggestHashtags } from '@/ai/flows/ai-suggest-hashtags-flow';
import { aiTranslatePost } from '@/ai/flows/ai-translate-post-flow';
import { aiGenerateDailyMixes } from '@/ai/flows/ai-generate-mixes-flow';
import { aiGenerateVerificationCode } from '@/ai/flows/ai-generate-verification-code-flow';
import { aiVerifySignature } from '@/ai/flows/ai-verify-signature-flow';
import { aiSummarizeComments } from '@/ai/flows/ai-summarize-comments-flow';
import { aiAuditGiftHandshake } from '@/ai/flows/ai-audit-gift-flow';
import { aiAuditMonetizationHandshake } from '@/ai/flows/ai-audit-monetization-flow';
import { aiAnalyzeGlobalSentiment } from '@/ai/flows/ai-analyze-sentiment-flow';
import { aiAuditBoostHandshake } from '@/ai/flows/ai-audit-boost-flow';

/**
 * Audits a boost campaign request using Groq AI.
 */
export async function aiAuditBoostHandshakeAction(input: { userBalance: number, boostCost: number, currencyType: 'STAR' | 'DIAMOND', durationDays: number }) {
  try {
    return await aiAuditBoostHandshake(input);
  } catch (error: any) {
    console.error("BOOST AUDIT DIAGNOSTIC:", error.message);
    const approved = input.userBalance >= input.boostCost;
    return {
      approved,
      promisedViews: Math.round((input.boostCost / (input.currencyType === 'DIAMOND' ? 25 : 30000)) * 10000),
      strategy: "Heuristic fallback active. Direct node prioritization.",
      message: approved ? "Boost authorized via fallback. (Note: AI Node was unreachable)" : "Insufficient energy for boost.",
      auditToken: approved ? "BST-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : ""
    };
  }
}

/**
 * Analyzes the collective vibe of the network using Groq.
 */
export async function aiAnalyzeGlobalSentimentAction({ messages }: { messages: string[] }) {
  try {
    return await aiAnalyzeGlobalSentiment({ messages });
  } catch (error: any) {
    console.error("SENTIMENT ANALYSIS DIAGNOSTIC:", error.message);
    return {
      score: 75,
      vibe: 'POSITIVE',
      summary: "Protocol fallback: Network vibe stable."
    };
  }
}

/**
 * Audits a monetization transaction (Locked Post or Subscription).
 */
export async function aiAuditMonetizationHandshakeAction(input: { type: 'LOCK_UNLOCK' | 'SUBSCRIPTION', userBalance: number, cost: number, currencyType: 'GOLD' | 'DIAMOND', creatorUsername: string }) {
  try {
    return await aiAuditMonetizationHandshake(input);
  } catch (error: any) {
    console.error("MONETIZATION AUDIT DIAGNOSTIC:", error.message);
    const approved = input.userBalance >= input.cost;
    return {
      approved,
      message: approved ? "Handshake protocol fallback initiated." : "Insufficient Energy.",
      auditToken: approved ? "MT-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : "",
      payoutAmount: input.cost * 0.7
    };
  }
}

/**
 * Audits a gift transaction using Groq AI.
 */
export async function aiAuditGiftHandshakeAction(input: { userBalance: number, giftCost: number, currencyType: 'GOLD' | 'DIAMOND' }) {
  try {
    return await aiAuditGiftHandshake(input);
  } catch (error: any) {
    console.error("GIFT AUDIT DIAGNOSTIC:", error.message);
    const approved = input.userBalance >= input.giftCost;
    return {
      approved,
      message: approved ? "Fallback handshake established." : "Insufficient Balance.",
      auditToken: approved ? "TX-FB-" + Math.random().toString(36).substring(2, 10).toUpperCase() : ""
    };
  }
}

/**
 * Summarizes a thread of comments using Groq.
 */
export async function aiSummarizeCommentsAction({ comments }: { comments: string[] }) {
  try {
    const result = await aiSummarizeComments({ comments });
    return { summary: result.summary };
  } catch (error: any) {
    console.error("COMMENT SUMMARIZATION DIAGNOSTIC:", error.message);
    return { summary: "Discussion pulse too complex." };
  }
}

/**
 * Audits a verification request using Groq AI.
 */
export async function aiRequestSignatureVerificationAction(input: { username: string, hasEverBeenVerified: boolean, currencyChoice: 'DIAMOND' | 'STAR' }) {
  try {
    return await aiVerifySignature(input);
  } catch (error: any) {
    console.error("VERIFICATION AUDIT DIAGNOSTIC:", error.message);
    const cost = input.hasEverBeenVerified 
      ? (input.currencyChoice === 'DIAMOND' ? 15 : 20000)
      : (input.currencyChoice === 'DIAMOND' ? 6 : 10000);
    
    return {
      approved: true,
      cost,
      durationDays: 30,
      message: "Direct protocol fallback initiated.",
      auditToken: "V-FB-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    };
  }
}

/**
 * Generates a unique 6-character verification code using Groq.
 */
export async function aiGenerateVerificationCodeAction({ packageName }: { packageName: string }) {
  try {
    return await aiGenerateVerificationCode({ packageName });
  } catch (error: any) {
    console.warn("AI CODE GENERATION DIAGNOSTIC:", error.message);
    const fallback = Math.random().toString(36).substring(2, 8).toUpperCase();
    return { code: fallback };
  }
}

/**
 * Generates music mix titles based on a vibe.
 */
export async function aiGenerateDailyMixesAction() {
  const vibes = ["Late Night Chill", "High Energy Workout", "Sunday Morning Soul", "Cyberpunk Future", "Tropical Vibes", "Emotional Acoustic"];
  const selectedVibe = vibes[Math.floor(Math.random() * vibes.length)];

  try {
    return await aiGenerateDailyMixes({ vibe: selectedVibe });
  } catch (error: any) {
    console.error("DAILY MIX DIAGNOSTIC:", error.message);
    return { mixes: ["Morning Chill", "Coding Beats", "Late Night", "Focus Flow", "Vibe Check", "Groove Hub"] };
  }
}

/**
 * Suggests hashtags for a post.
 */
export async function aiSuggestHashtagsAction({ postContent }: { postContent: string }) {
  try {
    return await aiSuggestHashtags({ postContent });
  } catch (error: any) {
    console.error("HASHTAG SUGGESTION DIAGNOSTIC:", error.message);
    return { hashtags: [] };
  }
}

/**
 * Summarizes a post.
 */
export async function aiSummarizePostAction({ postContent }: { postContent: string }) {
  try {
    return await aiSummarizePost({ postContent });
  } catch (error: any) {
    console.error("POST SUMMARIZATION DIAGNOSTIC:", error.message);
    return { summary: "Summarization pulse failed." };
  }
}

/**
 * Translates a post to the user's preferred language.
 */
export async function aiTranslatePostAction({ postContent, targetLanguage = "English" }: { postContent: string, targetLanguage?: string }) {
  try {
    return await aiTranslatePost({ postContent, targetLanguage });
  } catch (error: any) {
    console.error("TRANSLATION DIAGNOSTIC:", error.message);
    return { translation: "Translation pulse failed." };
  }
}
