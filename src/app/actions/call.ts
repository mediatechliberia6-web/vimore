'use server';

export async function generateAgoraToken(_channelName: string, _uid: number): Promise<string> {
  return 'mock_token_' + Date.now();
}
