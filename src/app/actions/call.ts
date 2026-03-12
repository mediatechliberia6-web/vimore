
'use server';

/**
 * @fileOverview ViMore Token Stub
 */

export async function generateAgoraToken(channelName: string, uid: string | number) {
  return "prototype_token_" + Math.random().toString(36).substring(2, 10);
}
