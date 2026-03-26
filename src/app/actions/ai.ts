'use server';

export async function aiTranslatePostAction({
  postContent,
  targetLanguage = 'English',
}: {
  postContent: string;
  targetLanguage?: string;
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { translation: postContent };

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text into ${targetLanguage}. Preserve the original tone, emojis, line breaks, and formatting exactly. Return ONLY the translated text — no explanations, no quotes, no extra words.`,
          },
          {
            role: 'user',
            content: postContent,
          },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) return { translation: postContent };

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim() || postContent;
    return { translation };
  } catch {
    return { translation: postContent };
  }
}
