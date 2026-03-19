'use server';

export async function generateAgoraToken(channelName: string, uid: string | number): Promise<string> {
  return `mock_token_${channelName}_${uid}`;
}
