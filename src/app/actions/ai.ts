'use server';

export async function aiTranslatePostAction({
  postContent,
}: {
  postContent: string;
  targetLanguage?: string;
}) {
  return { translation: postContent };
}
