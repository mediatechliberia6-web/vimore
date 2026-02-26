'use server';

import { aiSummarizePost as summarizeFlow } from '@/ai/flows/ai-summarize-post-flow';
import { aiSuggestHashtags as hashtagsFlow } from '@/ai/flows/ai-suggest-hashtags-flow';
import { aiTranslatePost as translateFlow } from '@/ai/flows/ai-translate-post-flow';
import { aiGenerateDailyMixes as mixesFlow } from '@/ai/flows/ai-generate-mixes-flow';

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
