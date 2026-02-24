'use server';

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates 6 personalized music mix titles based on a vibe using Groq AI.
 */
export async function aiGenerateDailyMixes() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const vibes = ["Late Night Chill", "High Energy Workout", "Sunday Morning Soul", "Cyberpunk Future", "Tropical Vibes", "Emotional Acoustic"];
  const selectedVibe = vibes[Math.floor(Math.random() * vibes.length)];

  const prompt = `You are a music curator for a high-end streaming service. 
  Generate 6 unique, creative, and short playlist titles for "Daily Mixes" based on the vibe: "${selectedVibe}".
  The titles should be punchy, evocative, and no more than 3 words each.
  Return ONLY a JSON object with a key "mixes" containing an array of strings.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || '{"mixes": []}';
    const parsed = JSON.parse(content);
    return { mixes: parsed.mixes || [] };
  } catch (error) {
    console.error("Groq Daily Mix Error:", error);
    return { mixes: ["Morning Chill", "Coding Beats", "Late Night", "Focus Flow", "Vibe Check", "Groove Hub"] };
  }
}

/**
 * Suggests hashtags for a post using Groq AI.
 */
export async function aiSuggestHashtags({ postContent }: { postContent: string }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `You are a social media expert. Based on the following post content, suggest 5-10 highly relevant and popular hashtags. 
  Return ONLY a JSON object with a key "hashtags" containing an array of strings.
  
  Post content: "${postContent}"`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || '{"hashtags": []}';
    const parsed = JSON.parse(content);
    return { hashtags: parsed.hashtags || [] };
  } catch (error) {
    console.error("Groq Hashtag Suggestion Error:", error);
    return { hashtags: [] };
  }
}

/**
 * Summarizes a post using Groq AI.
 */
export async function aiSummarizePost({ postContent }: { postContent: string }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `Summarize the following post content concisely for a social media caption or message. Keep it brief, engaging, and under 150 characters.
  
  Post Content: "${postContent}"`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    return { summary: completion.choices[0]?.message?.content?.trim() || "" };
  } catch (error) {
    console.error("Groq Summarization Error:", error);
    return { summary: "Could not generate summary." };
  }
}

/**
 * Translates a post to the user's preferred language (defaults to English) using Groq AI.
 */
export async function aiTranslatePost({ postContent, targetLanguage = "English" }: { postContent: string, targetLanguage?: string }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `Translate the following social media post into ${targetLanguage}. Maintain the original tone and emojis. Return ONLY the translated text.
  
  Post Content: "${postContent}"`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    return { translation: completion.choices[0]?.message?.content?.trim() || "Translation failed." };
  } catch (error) {
    console.error("Groq Translation Error:", error);
    return { translation: "Could not translate post." };
  }
}
